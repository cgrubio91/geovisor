import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GeovisorComponent } from './pages/geovisor/geovisor.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './pages/admin/users/admin-users.component';
import { AdminProjectsComponent } from './pages/admin/projects/admin-projects.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'viewer/:id', component: GeovisorComponent },
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'users', component: AdminUsersComponent },
            { path: 'projects', component: AdminProjectsComponent },
            { path: 'files', loadComponent: () => import('./pages/admin/files/admin-files.component').then(m => m.AdminFilesComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
