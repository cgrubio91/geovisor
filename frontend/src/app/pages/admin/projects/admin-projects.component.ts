import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-projects',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="projects-container">
      <div class="list-header">
        <h2>Gestión de Proyectos</h2>
        <button class="btn btn-primary" (click)="showCreate = true" *ngIf="!showCreate">
          + Nuevo Proyecto
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div class="card form-panel" *ngIf="showCreate">
        <h3>Crear Nuevo Proyecto</h3>
        <form (submit)="saveProject()">
          <div class="form-group">
            <label>Nombre del Proyecto</label>
            <input type="text" [(ngModel)]="newProject.name" name="name" placeholder="Nombre del proyecto" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea [(ngModel)]="newProject.description" name="description" placeholder="Descripción del proyecto" class="form-control" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Personal Asignado</label>
            <div class="checkbox-list">
              <label *ngFor="let u of availableUsers">
                <input type="checkbox" (change)="toggleUser(u.id)"> {{ u.name }} ({{ u.role }})
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Crear</button>
            <button type="button" class="btn btn-outline" (click)="showCreate = false">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Projects List -->
      <div class="items-list" *ngIf="!showCreate">
        <div *ngFor="let p of projects" class="card item-card">
          <div class="item-main">
            <div class="item-icon">📁</div>
            <div class="item-info">
              <h4>{{ p.name }}</h4>
              <span class="meta">{{ p.users_count }} usuarios asignados • {{ p.layers_count }} capas</span>
            </div>
          </div>
          <div class="item-actions">
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
    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .checkbox-list label {
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
    .item-card {
      padding: 15px 25px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-main {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .item-icon {
      width: 45px;
      height: 45px;
      background: #e0f2f1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--primary);
    }
    .item-info h4 {
      margin: 0;
      color: var(--secondary);
    }
    .item-info .meta {
      font-size: 0.85rem;
      color: var(--gray-600);
    }
    .item-actions {
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
export class AdminProjectsComponent {
    showCreate = false;
    newProject = { name: '', description: '' };

    availableUsers = [
        { id: 1, name: 'Administrador', role: 'admin' },
        { id: 2, name: 'Juan Pérez', role: 'user' },
        { id: 3, name: 'María González', role: 'user' }
    ];

    projects = [
        { id: 1, name: 'Proyecto Carretera Norte', users_count: 2, layers_count: 3 },
        { id: 2, name: 'Urbanización El Bosque', users_count: 3, layers_count: 3 },
        { id: 3, name: 'Minería Santa Rita', users_count: 2, layers_count: 3 }
    ];

    toggleUser(id: number) {
    }

    saveProject() {
        this.showCreate = false;
    }
}
