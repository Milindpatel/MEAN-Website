import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { HomePage } from './pages/home';
import { HotelDetailPage } from './pages/hotel-detail';
import { HotelListPage } from './pages/hotel-list';
import { ProfilePage } from './pages/profile';
import { RegisterPage } from './pages/register';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'MEAN Hotel' },
  { path: 'hotels', component: HotelListPage, title: 'Hotels' },
  { path: 'hotels/:id', component: HotelDetailPage, title: 'Hotel' },
  { path: 'register', component: RegisterPage, title: 'Register' },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard], title: 'Profile' },
  { path: '**', redirectTo: '' },
];
