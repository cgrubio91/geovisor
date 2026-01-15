import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="main-header">
      <div class="header-content container">
        <div class="logo-area">
          <span class="logo-icon">🌐</span>
          <div class="logo-text">
            <h1>Geovisor</h1>
            <span>Administrador</span>
          </div>
        </div>
        <div class="nav-actions">
          <button class="btn btn-outline btn-sm" routerLink="/admin/dashboard">
            <span>⚙️</span> Administración
          </button>
          <button class="btn btn-secondary btn-sm" (click)="logout()">
            <span>🚪</span> Salir
          </button>
        </div>
      </div>
    </header>

    <main class="container">
      <section class="projects-section">
        <div class="section-header">
          <h2>Mis Proyectos</h2>
          <p>Selecciona un proyecto para acceder al geovisor</p>
        </div>

        <div class="projects-grid">
          <div *ngFor="let project of projects" class="card project-card">
            <div class="card-status" [class.active]="project.status === 'Activo'">
              {{ project.status }}
            </div>
            <div class="card-icon">
              <span class="icon-box"></span>
            </div>
            <div class="card-body">
              <h3>{{ project.name }}</h3>
              <p class="description">{{ project.description }}</p>
              
              <div class="meta-info">
                <span>📅 {{ project.date }}</span>
                <span>👥 {{ project.people }}</span>
              </div>
              
              <div class="layers-preview">
                <span class="layers-count">{{ project.layers.length }} capas disponibles</span>
                <div class="layer-tags">
                  <span *ngFor="let layer of project.layers" [style.background-color]="layer.color" class="layer-tag">
                    {{ layer.name }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-full" (click)="openProject(project.id)">
                Abrir Geovisor
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .main-header {
      background: white;
      padding: 15px 0;
      box-shadow: var(--shadow-sm);
      margin-bottom: 40px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 2rem;
      background: var(--primary);
      padding: 5px 10px;
      border-radius: 8px;
      color: white;
    }
    .logo-text h1 {
      font-size: 1.4rem;
      color: var(--secondary);
      line-height: 1;
    }
    .logo-text span {
      font-size: 0.8rem;
      color: var(--gray-600);
    }
    .nav-actions {
      display: flex;
      gap: 10px;
    }
    .btn-sm {
      padding: 6px 15px;
      font-size: 0.9rem;
    }
    .section-header {
      margin-bottom: 30px;
    }
    .section-header h2 {
      font-size: 1.8rem;
      color: var(--secondary);
    }
    .section-header p {
      color: var(--gray-600);
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }
    .project-card {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--gray-200);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .project-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
    }
    .card-status {
      position: absolute;
      top: 15px;
      right: 15px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--gray-600);
    }
    .card-status.active {
      color: green;
    }
    .card-status.active::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: green;
      border-radius: 50%;
      margin-right: 5px;
    }
    .card-icon {
      padding: 20px 20px 10px;
    }
    .icon-box {
      display: block;
      width: 40px;
      height: 40px;
      background: var(--primary);
      border-radius: 8px;
    }
    .card-body {
      padding: 0 20px 20px;
      flex-grow: 1;
    }
    .card-body h3 {
      font-size: 1.2rem;
      color: var(--secondary);
      margin-bottom: 8px;
    }
    .description {
      font-size: 0.9rem;
      color: var(--gray-600);
      margin-bottom: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .meta-info {
      display: flex;
      gap: 15px;
      font-size: 0.85rem;
      color: var(--gray-600);
      margin-bottom: 15px;
    }
    .layers-preview {
      border-top: 1px solid var(--gray-200);
      padding-top: 15px;
    }
    .layers-count {
      display: block;
      font-size: 0.8rem;
      color: var(--gray-600);
      margin-bottom: 10px;
    }
    .layer-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .layer-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: white;
    }
    .card-footer {
      padding: 0 20px 20px;
    }
    .btn-full {
      width: 100%;
      justify-content: center;
    }
  `]
})
export class DashboardComponent {
  projects: any[] = [];

  constructor(
    private router: Router,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(data => {
      // Map backend data to UI format if needed
      // Backend returns: name, desc, created_at, layers, measurements, users
      this.projects = data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || p.desc,
        date: new Date(p.created_at || Date.now()).toLocaleDateString(),
        people: p.users ? p.users.length : 0,
        status: 'Activo', // Default status
        layers: p.layers ? p.layers.map((l: any) => ({
          name: l.name,
          color: this.getRandomColor()
        })) : []
      }));
    });
  }

  getRandomColor() {
    const colors = ['#FF671C', '#6c757d', '#8d6e63', '#4caf50', '#2196f3', '#ff9800', '#00C1D2'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  openProject(id: number) {
    this.router.navigate(['/viewer', id]);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
