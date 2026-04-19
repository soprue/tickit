import '@styles/style.css';
import { Router } from '@core/Router';
import ReminderPage from '@features/reminder/presentation/ReminderPage';
import LoginPage from '@features/auth/presentation/LoginPage';

document.addEventListener('DOMContentLoaded', function () {
  const router = Router.getInstance();
  router.add('/', ReminderPage);
  router.add('/login', LoginPage);

  router.resolve();
});
