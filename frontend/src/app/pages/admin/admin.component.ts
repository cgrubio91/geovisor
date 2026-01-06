import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterModule],
    template: `
    <div class="admin-layout">
      <header class="admin-header">
        <div class="container header-flex">
          <div class="left">
            <button class="btn-back" (click)="goBack()">
              <span class="icon">⬅️</span> Volver
            </button>
            <h1>Panel de Administración</h1>
          </div>
          <nav class="admin-nav">
            <a routerLink="dashboard" routerLinkActive="active" class="nav-item">
              <span>📊</span> Dashboard
            </a>
            <a routerLink="users" routerLinkActive="active" class="nav-item">
              <span>👥</span> Usuarios
            </a>
            <a routerLink="projects" routerLinkActive="active" class="nav-item">
              <span>📁</span> Proyectos
            </a>
          </nav>
        </div>
      </header>
      
      <main class="admin-content container">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`
    .admin-layout {
      min-height: 100vh;
      background-color: #f4f7f9;
    }
    .admin-header {
      background: white;
      padding: 15px 0;
      box-shadow: var(--shadow-sm);
      margin-bottom: 30px;
    }
    .header-flex {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .left {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .btn-back {
      background: var(--primary);
      border: none;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .left h1 {
      font-size: 1.4rem;
      color: var(--secondary);
    }
    .admin-nav {
      display: flex;
      gap: 10px;
    }
    .nav-item {
      text-decoration: none;
      color: var(--primary);
      padding: 8px 15px;
      border-radius: 8px;
      background: rgba(0, 193, 210, 0.1);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .nav-item.active {
      background: var(--primary);
      color: white;
    }
    .nav-item:hover:not(.active) {
      border-color: var(--primary);
    }
    .admin-content {
      padding-bottom: 40px;
    }
  `]
})
export class AdminComponent {
    constructor(private router: Router) { }
    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
