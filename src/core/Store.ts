import { DELAYS } from '@src/shared/constants';

export type Listener = () => void;

/**
 * 전역 상태 관리를 위한 Store 클래스
 */
export class Store<T extends object> {
  protected state: T;
  protected storageKey: string | null;
  private listeners: Set<Listener> = new Set();
  
  private _isSaving = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(initialState: T, storageKey: string | null = null) {
    this.storageKey = storageKey;
    this.state = initialState;
    this.loadInitialState();
  }

  get isSaving() { return this._isSaving; }

  private async loadInitialState() {
    if (!this.storageKey || typeof window === 'undefined' || !(window as any).api) return;
    try {
      const savedData = await (window as any).api.invoke('reminder:get-all', this.storageKey);
      if (savedData) {
        // 데이터 복원(Hydration) 훅 호출 후 상태 업데이트
        this.state = this.hydrate(savedData);
        this.notify();
      } else {
        // 데이터가 없으면 초기 상태 강제 저장
        this.forceSave();
      }
    } catch (e) {
      console.error(`[Store] Load error:`, e);
    }
  }

  /**
   * 저장소에서 불러온 데이터를 현재 상태에 맞게 변환하는 훅 (자식 클래스에서 오버라이드)
   */
  protected hydrate(data: any): T {
    return { ...this.state, ...data };
  }

  getState(): T { return this.state; }

  setState(newState: Partial<T>) {
    const nextState = { ...this.state, ...newState };
    if (JSON.stringify(this.state) === JSON.stringify(nextState)) return;

    this.state = nextState;
    this.notify();

    if (this.storageKey) {
      this.debounceSave();
    }
  }

  /**
   * [Refactor] 불변성을 유지하며 상태의 깊은 경로를 업데이트하는 유틸리티
   */
  protected updateDeepState(updater: (state: T) => Partial<T>) {
    this.setState(updater(this.state));
  }

  /**
   * 현재 상태를 강제로 저장소에 저장합니다.
   */
  public forceSave() {
    if (this.storageKey) {
      this.debounceSave();
    }
  }

  private debounceSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this._isSaving = true;
    this.notify();

    this.saveTimeout = setTimeout(async () => {
      if (!this.storageKey || !(window as any).api) return;
      try {
        await (window as any).api.invoke('reminder:save', {
          key: this.storageKey,
          data: this.state
        });
      } catch (err) {
        console.error('[Store] Save failed:', err);
      } finally {
        this._isSaving = false;
        this.notify();
      }
    }, DELAYS.SAVE_DEBOUNCE);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
