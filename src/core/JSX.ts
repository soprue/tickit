export const Fragment = Symbol('Fragment');

export type VNodeType = string | Function | typeof Fragment;

export interface VNode {
  type: VNodeType;
  props: Record<string, any>;
  children: any[];
}

export type VNodeChild = VNode | string | number | boolean | null | undefined;

const REF_PREFIX = '__VAL_REF_';

/**
 * 가상 DOM 트리를 평면화하여 Fragment를 제거하고 실제 DOM 인덱스와 일치시킵니다.
 */
function flatten(children: any[]): any[] {
  return children.reduce((acc, child) => {
    if (Array.isArray(child)) {
      acc.push(...flatten(child));
    } else if (child && typeof child === 'object' && child.type === Fragment) {
      acc.push(...flatten(child.children));
    } else if (child !== null && child !== undefined && child !== false && child !== '') {
      acc.push(child);
    }
    return acc;
  }, []);
}

export function h(type: VNodeType, props: Record<string, any> | null, ...children: any[]): VNode {
  return {
    type,
    props: props || {},
    children: flatten(children),
  };
}

export function jsx(strings: TemplateStringsArray, ...args: any[]): VNode {
  const htmlString = strings.reduce((acc, str, i) => {
    const replacement = i < args.length ? `${REF_PREFIX}${i}__` : '';
    return acc + str + replacement;
  }, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const domToVNode = (node: Node): VNodeChild => {
    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.nodeValue || '';
      if (!content.includes(REF_PREFIX)) return content;

      const regex = new RegExp(`(${REF_PREFIX}[0-9]+__)`, 'g');
      const parts = content.split(regex).map(part => {
        if (part.startsWith(REF_PREFIX)) {
          const index = parseInt(part.replace(REF_PREFIX, '').replace('__', ''));
          return args[index];
        }
        return part;
      }).filter(p => p !== '');
      
      return parts.length === 1 ? parts[0] : h(Fragment, null, ...parts);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as Element;
    const props: Record<string, any> = {};
    Array.from(element.attributes).forEach(attr => {
      let val: any = attr.value;
      const regex = new RegExp(`${REF_PREFIX}([0-9]+)__`, 'g');
      
      const matches = val.match(regex);
      if (matches && matches.length === 1 && matches[0] === val) {
        const index = parseInt(matches[0].replace(REF_PREFIX, '').replace('__', ''));
        val = args[index];
      } else if (matches) {
        val = val.replace(regex, (match: string) => {
          const index = parseInt(match.replace(REF_PREFIX, '').replace('__', ''));
          return args[index];
        });
      }
      props[attr.name] = val;
    });

    const children = Array.from(node.childNodes).map(domToVNode).flat().filter(c => c !== null && c !== '');
    return h(element.tagName.toLowerCase(), props, ...children);
  };

  const restoredNodes = Array.from(doc.body.childNodes)
    .map(domToVNode)
    .flat()
    .filter(n => {
      if (typeof n === 'string' && n.trim() === '') return false;
      return n !== null && n !== '';
    });

  if (restoredNodes.length === 1 && typeof restoredNodes[0] === 'object' && !Array.isArray(restoredNodes[0])) {
    return restoredNodes[0] as VNode;
  }
  return h(Fragment, null, ...restoredNodes);
}

export default jsx;

export function createDOM(vNode: VNodeChild): Node {
  if (typeof vNode === 'string' || typeof vNode === 'number') return document.createTextNode(String(vNode));
  if (!vNode || typeof vNode === 'boolean') return document.createComment('v-node-placeholder');
  
  if (Array.isArray(vNode)) {
    const frag = document.createDocumentFragment();
    vNode.forEach((c) => frag.appendChild(createDOM(c)));
    return frag;
  }

  const node = vNode as VNode;
  if (node.type === Fragment) {
    const frag = document.createDocumentFragment();
    if (node.children) {
      node.children.forEach((c) => frag.appendChild(createDOM(c)));
    }
    return frag;
  }

  const $el = document.createElement(node.type as string);
  Object.entries(node.props || {}).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      $el.addEventListener(key.toLowerCase().substring(2), value as EventListener);
    } else {
      $el.setAttribute(key === 'className' ? 'class' : key, String(value));
    }
  });

  if (node.children) {
    node.children.forEach((c) => {
      const $child = createDOM(c);
      if ($child) $el.appendChild($child);
    });
  }
  return $el;
}

export function updateDOM($parent: Node, newNode: VNodeChild, oldNode: VNodeChild, index = 0) {
  if (!$parent) return;

  const $child = $parent.childNodes[index];

  // 1. 노드 삭제 (새 노드가 없는 경우)
  if (!newNode) {
    if ($child) $parent.removeChild($child);
    return;
  }

  // 2. 노드 생성 (기존 노드가 없는 경우)
  if (oldNode === undefined || !$child) {
    $parent.appendChild(createDOM(newNode));
    return;
  }

  // 3. 노드 교체 (타입이 바뀌었거나 내용이 변한 경우)
  if (isChanged(newNode, oldNode)) {
    $parent.replaceChild(createDOM(newNode), $child);
    return;
  }

  // 4. 노드 업데이트 (동일한 타입인 경우 속성 및 자식 비교)
  if (typeof newNode === 'object' && newNode !== null && typeof oldNode === 'object' && oldNode !== null) {
    const n = newNode as VNode;
    const o = oldNode as VNode;
    
    if ($child instanceof HTMLElement) {
      updateAttributes($child, o.props, n.props);
    }

    const newChildren = n.children || [];
    const oldChildren = o.children || [];
    const max = Math.max(newChildren.length, oldChildren.length);
    
    for (let i = 0; i < max; i++) {
      updateDOM($child, newChildren[i], oldChildren[i], i);
    }
  }
}

function updateAttributes($el: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>) {
  const allProps = { ...oldProps, ...newProps };
  Object.keys(allProps).forEach(key => {
    const oldValue = oldProps[key];
    const newValue = newProps[key];

    if (oldValue !== newValue) {
      const name = key.toLowerCase().startsWith('on') ? key.toLowerCase().substring(2) : key;
      if (key.toLowerCase().startsWith('on')) {
        if (typeof oldValue === 'function') $el.removeEventListener(name, oldValue as EventListener);
        if (typeof newValue === 'function') $el.addEventListener(name, newValue as EventListener);
      } else if (newValue === undefined || newValue === null || newValue === false) {
        $el.removeAttribute(key === 'className' ? 'class' : key);
      } else {
        $el.setAttribute(key === 'className' ? 'class' : key, String(newValue));
      }
    }
  });
}

function isChanged(n1: VNodeChild, n2: VNodeChild) {
  if (typeof n1 !== typeof n2) return true;
  if (typeof n1 === 'string' || typeof n1 === 'number') return String(n1) !== String(n2);
  if (!n1 || !n2) return n1 !== n2;
  
  const v1 = n1 as VNode;
  const v2 = n2 as VNode;
  
  // 타입이 다르면 변경된 것으로 간주
  return v1.type !== v2.type;
}
