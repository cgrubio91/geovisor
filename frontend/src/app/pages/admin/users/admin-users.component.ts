import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="users-container">
      <div class="list-header">
        <h2>Gestión de Usuarios</h2>
        <button class="btn btn-primary" (click)="showCreate = true" *ngIf="!showCreate">
          + Nuevo Usuario
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div class="card form-panel" *ngIf="showCreate">
        <h3>Crear Nuevo Usuario</h3>
        <form (submit)="saveUser()">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="newUser.name" name="name" placeholder="Nombre completo" class="form-control">
            </div>
            <div class="form-group">
              <label>Código de Acceso</label>
              <input type="text" [(ngModel)]="newUser.code" name="code" placeholder="USER001" class="form-control">
            </div>
          </div>
          
          <div class="form-group">
            <label>Rol</label>
            <div class="radio-group">
              <label><input type="radio" [(ngModel)]="newUser.role" name="role" value="User"> Usuario</label>
              <label><input type="radio" [(ngModel)]="newUser.role" name="role" value="Admin"> Administrador</label>
            </div>
          </div>

          <div class="form-group">
            <label>Proyectos Asignados</label>
            <div class="checkbox-list">
              <label *ngFor="let p of availableProjects">
                <input type="checkbox" (change)="toggleProject(p.id)"> {{ p.name }}
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Crear</button>
            <button type="button" class="btn btn-outline" (click)="showCreate = false">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- User List -->
      <div class="user-list" *ngIf="!showCreate">
        <div *ngFor="let user of users" class="card user-card">
          <div class="user-main">
            <div class="user-avatar">👤</div>
            <div class="user-info">
              <h4>{{ user.full_name }}</h4>
              <p>Código: {{ user.access_code }}</p>
              <span class="meta">Rol: {{ user.role }} • Proyectos: {{ user.projects_count }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn-text edit">✏️ Editar</button>
            <button class="btn-text delete">🚫 Desactivar</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }
    .list-header h2 {
      color: var(--secondary);
      font-size: 1.3rem;
    }
    .form-panel {
      padding: 30px;
      margin-bottom: 30px;
    }
    .form-panel h3 {
      font-size: 1.1rem;
      margin-bottom: 20px;
      color: var(--secondary);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
    }
    .radio-group, .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .radio-group label, .checkbox-list label {
      font-weight: 400;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .user-card {
      padding: 15px 25px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-main {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .user-avatar {
      width: 45px;
      height: 45px;
      background: #e1f5fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--primary);
    }
    .user-info h4 {
      margin: 0;
      color: var(--secondary);
    }
    .user-info p {
      margin: 2px 0;
      font-size: 0.85rem;
      color: var(--gray-600);
    }
    .user-info .meta {
      font-size: 0.8rem;
      color: var(--gray-600);
    }
    .user-actions {
      display: flex;
      gap: 15px;
    }
    .btn-text {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-text.edit {
      color: var(--primary);
    }
    .btn-text.delete {
      color: #f44336;
    }
  `]
})
export class AdminUsersComponent {
    showCreate = false;
    newUser = { name: '', code: '', role: 'User' };

    availableProjects = [
        { id: 1, name: 'Proyecto Carretera Norte' },
        { id: 2, name: 'Urbanización El Bosque' },
        { id: 3, name: 'Minería Santa Rita' }
    ];

    users = [
        { id: 1, full_name: 'Administrador', access_code: 'ADMIN001', role: 'Admin', projects_count: 3 },
        { id: 2, full_name: 'Juan Pérez', access_code: 'USER001', role: 'User', projects_count: 2 },
        { id: 3, full_name: 'María González', access_code: 'USER002', role: 'User', projects_count: 2 }
    ];

    toggleProject(id: number) {
        // Logic to update new user's projects
    }

    saveUser() {
        this.showCreate = false;
        // Call service to save
    }
}
