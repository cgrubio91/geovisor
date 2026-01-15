import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ProjectService } from '../../../services/project.service';

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
        <h3>{{ newProject.id ? 'Editar Proyecto' : 'Crear Nuevo Proyecto' }}</h3>
        <form (submit)="saveProject()">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre del Proyecto</label>
              <input type="text" [(ngModel)]="newProject.name" name="name" placeholder="Nombre del proyecto" class="form-control">
            </div>
            <div class="form-group">
              <label>Ubicación</label>
              <input type="text" [(ngModel)]="newProject.location" name="location" placeholder="Ciudad / Región" class="form-control">
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Fecha de Inicio</label>
              <input type="date" [(ngModel)]="newProject.start_date" name="start_date" class="form-control">
            </div>
            <div class="form-group">
              <label>Etapa del Proyecto</label>
              <select [(ngModel)]="newProject.stage" name="stage" class="form-control">
                <option value="Planificación">Planificación</option>
                <option value="Ejecución">Ejecución</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea [(ngModel)]="newProject.description" name="description" placeholder="Descripción del proyecto" class="form-control" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Personal Asignado</label>
            <div class="checkbox-list">
              <label *ngFor="let u of availableUsers">
                <input type="checkbox" [checked]="selectedUserIds.has(u.id)" (change)="toggleUser(u.id)"> {{ u.full_name }} ({{ u.role }})
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ newProject.id ? 'Guardar Cambios' : 'Crear' }}</button>
            <button type="button" class="btn btn-outline" (click)="resetForm()">Cancelar</button>
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
            <button class="btn-text edit" (click)="editProject(p)">✏️ Editar</button>
            <button class="btn-text delete" (click)="deleteProject(p)">🚫 Desactivar</button>
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
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
  `]
})
export class AdminProjectsComponent {
  showCreate = false;
  newProject: any = { name: '', description: '', user_ids: [] };
  selectedUserIds: Set<number> = new Set();

  availableUsers: any[] = [];
  projects: any[] = [];

  constructor(
    private projectService: ProjectService,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.loadProjects();
    this.loadUsers();
  }

  loadProjects() {
    this.adminService.getProjectsSummary().subscribe(data => {
      this.projects = data;
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe(data => {
      this.availableUsers = data;
    });
  }

  toggleUser(id: number) {
    if (this.selectedUserIds.has(id)) {
      this.selectedUserIds.delete(id);
    } else {
      this.selectedUserIds.add(id);
    }
  }

  saveProject() {
    const payload: any = {
      name: this.newProject.name,
      description: this.newProject.description,
      location: this.newProject.location,
      start_date: this.newProject.start_date,
      stage: this.newProject.stage,
      user_ids: Array.from(this.selectedUserIds)
    };

    if (this.newProject.id) {
      this.projectService.updateProject(this.newProject.id, payload).subscribe(() => {
        this.resetForm();
        this.loadProjects();
      });

    } else {
      // Create new
      this.projectService.createProject(payload).subscribe(() => {
        this.resetForm();
        this.loadProjects();
      });
    }
  }

  editProject(p: any) {
    this.projectService.getProject(p.id).subscribe(details => {
      this.newProject = {
        ...details,
        start_date: details.start_date ? details.start_date.split('T')[0] : ''
      };
      this.selectedUserIds = new Set(details.users?.map((u: any) => u.id) || []);
      this.showCreate = true;
    });
  }

  deleteProject(p: any) {
    if (confirm(`¿Estás seguro de desactivar el proyecto ${p.name}?`)) {
      this.projectService.updateProject(p.id, { status: 'inactive' }).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  resetForm() {
    this.showCreate = false;
    this.newProject = { name: '', description: '', user_ids: [] };
    this.selectedUserIds.clear();
  }
}

