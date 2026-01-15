import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-grid" *ngIf="stats">
      <!-- Stats Cards -->
      <div class="stat-card" [style.border-left-color]="'var(--primary)'">
        <div class="stat-info">
          <span class="label">Usuarios Activos</span>
          <span class="value">{{ stats.active_users }}</span>
          <span class="subtext">de {{ stats.total_users }} totales</span>
        </div>
        <div class="stat-icon" [style.background-color]="'var(--primary)'">👤</div>
      </div>

      <div class="stat-card" [style.border-left-color]="'var(--secondary)'">
        <div class="stat-info">
          <span class="label">Proyectos</span>
          <span class="value">{{ stats.total_projects }}</span>
          <span class="subtext">en el sistema</span>
        </div>
        <div class="stat-icon" [style.background-color]="'var(--secondary)'">📁</div>
      </div>

      <div class="stat-card" [style.border-left-color]="'var(--accent)'">
        <div class="stat-info">
          <span class="label">Capas Totales</span>
          <span class="value">{{ stats.total_layers }}</span>
          <span class="subtext">en todos los proyectos</span>
        </div>
        <div class="stat-icon" [style.background-color]="'var(--accent)'">📚</div>
      </div>

      <div class="stat-card" [style.border-left-color]="'#4caf50'">
        <div class="stat-info">
          <span class="label">Promedio Capas/Proyecto</span>
          <span class="value">{{ stats.avg_layers_per_project }}</span>
          <span class="subtext">capas por proyecto</span>
        </div>
        <div class="stat-icon" [style.background-color]="'#4caf50'">📈</div>
      </div>
    </div>

    <div class="dashboard-rows" *ngIf="stats">
      <div class="row-left">
        <!-- Distribution -->
        <div class="card panel">
           <h3>Distribución de Usuarios</h3>
           <div class="dist-item">
             <div class="dist-info">
               <span>Administradores</span>
               <span>{{ stats.user_distribution.admins }}</span>
             </div>
             <div class="progress-bar"><div class="fill" [style.width.%]="(stats.user_distribution.admins / stats.total_users) * 100" [style.background-color]="'var(--secondary)'"></div></div>
           </div>
           <div class="dist-item">
             <div class="dist-info">
               <span>Usuarios Regulares</span>
               <span>{{ stats.user_distribution.regular }}</span>
             </div>
             <div class="progress-bar"><div class="fill" [style.width.%]="(stats.user_distribution.regular / stats.total_users) * 100" [style.background-color]="'var(--primary)'"></div></div>
           </div>
           <div class="dist-item">
             <div class="dist-info">
               <span>Usuarios Inactivos</span>
               <span>{{ stats.user_distribution.inactive }}</span>
             </div>
             <div class="progress-bar"><div class="fill" [style.width.%]="stats.total_users > 0 ? (stats.user_distribution.inactive / stats.total_users) * 100 : 0"></div></div>
           </div>
        </div>

        <!-- Recent Activity -->
        <div class="card panel">
           <h3>Actividad Reciente</h3>
           <div class="activity-list">
             <div class="activity-item" *ngFor="let act of stats.recent_activity">
               <span class="dot" [style.background-color]="act.type === 'user' ? 'var(--secondary)' : 'var(--primary)'"></span>
               <div class="act-text">
                 <p>{{ act.text }}</p>
                 <span class="time">{{ act.time }}</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div class="row-right">
        <!-- System Status -->
        <div class="card panel status-panel">
          <h3>Estado del Sistema</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-dot online"></span>
              <span>Backend Conectado</span>
            </div>
            <div class="status-item">
              <span class="status-dot online"></span>
              <span>Base de Datos Operativa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      border-left: 5px solid;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-info .label {
      font-size: 0.85rem;
      color: var(--gray-600);
    }
    .stat-info .value {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--secondary);
    }
    .stat-info .subtext {
      font-size: 0.75rem;
      color: var(--gray-600);
    }
    .stat-icon {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    .dashboard-rows {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .panel {
      padding: 25px;
      margin-bottom: 20px;
    }
    .panel h3 {
      font-size: 1.1rem;
      color: var(--secondary);
      margin-bottom: 20px;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: 10px;
    }
    .dist-item {
      margin-bottom: 15px;
    }
    .dist-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    .progress-bar {
      height: 8px;
      background: var(--gray-200);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar .fill {
      height: 100%;
      border-radius: 4px;
    }
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .activity-item {
      display: flex;
      gap: 12px;
    }
    .activity-item .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .act-text p {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .act-text .time {
      font-size: 0.75rem;
      color: var(--gray-600);
    }
    .status-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .status-dot.online {
      background: #4caf50;
      box-shadow: 0 0 5px #4caf50;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.adminService.getStats().subscribe(data => {
      this.stats = data;
    });
  }
}
