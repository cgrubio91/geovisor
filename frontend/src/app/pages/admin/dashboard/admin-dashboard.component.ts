import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-grid">
      <!-- Stats Cards -->
      <div class="stat-card" [style.border-left-color]="'var(--primary)'">
        <div class="stat-info">
          <span class="label">Usuarios Activos</span>
          <span class="value">3</span>
          <span class="subtext">de 3 totales</span>
        </div>
        <div class="stat-icon" [style.background-color]="'var(--primary)'">👤</div>
      </div>

      <div class="stat-card" [style.border-left-color]="'var(--secondary)'">
        <div class="stat-info">
          <span class="label">Proyectos</span>
          <span class="value">3</span>
          <span class="subtext">en el sistema</span>
        </div>
        <div class="stat-icon" [style.background-color]="'var(--secondary)'">📁</div>
      </div>

      <div class="stat-card" [style.border-left-color]="'var(--accent)'">
        <div class="stat-info">
          <span class="label">Capas Totales</span>
          <span class="value">9</span>
          <span class="subtext">en todos los proyectos</span>
        </div>
        <div class="stat-icon" [style.background-color]="'var(--accent)'">📚</div>
      </div>

      <div class="stat-card" [style.border-left-color]="'#4caf50'">
        <div class="stat-info">
          <span class="label">Promedio Capas/Proyecto</span>
          <span class="value">3.0</span>
          <span class="subtext">capas por proyecto</span>
        </div>
        <div class="stat-icon" [style.background-color]="'#4caf50'">📈</div>
      </div>
    </div>

    <div class="dashboard-rows">
      <div class="row-left">
        <!-- Distribution -->
        <div class="card panel">
           <h3>Distribución de Usuarios</h3>
           <div class="dist-item">
             <div class="dist-info">
               <span>Administradores</span>
               <span>1</span>
             </div>
             <div class="progress-bar"><div class="fill" [style.width]="'33%'" [style.background-color]="'var(--secondary)'"></div></div>
           </div>
           <div class="dist-item">
             <div class="dist-info">
               <span>Usuarios Regulares</span>
               <span>2</span>
             </div>
             <div class="progress-bar"><div class="fill" [style.width]="'66%'" [style.background-color]="'var(--primary)'"></div></div>
           </div>
           <div class="dist-item">
             <div class="dist-info">
               <span>Usuarios Inactivos</span>
               <span>0</span>
             </div>
             <div class="progress-bar"><div class="fill" [style.width]="'0%'"></div></div>
           </div>
        </div>

        <!-- Recent Activity -->
        <div class="card panel">
           <h3>Actividad Reciente</h3>
           <div class="activity-list">
             <div class="activity-item">
               <span class="dot" [style.background-color]="'var(--secondary)'"></span>
               <div class="act-text">
                 <p>Nuevo usuario creado: Juan Pérez</p>
                 <span class="time">Hace 2 horas</span>
               </div>
             </div>
             <div class="activity-item">
               <span class="dot" [style.background-color]="'var(--primary)'"></span>
               <div class="act-text">
                 <p>Proyecto actualizado: Carretera Norte</p>
                 <span class="time">Hace 5 horas</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div class="row-right">
        <!-- Active Projects -->
        <div class="card panel">
          <h3>Proyectos Más Activos</h3>
          <div class="active-list">
             <div class="active-item">
                <span class="number">1</span>
                <div class="item-text">
                  <p>Urbanización El Bosque</p>
                  <span>3 usuarios • 3 capas</span>
                </div>
             </div>
             <div class="active-item">
                <span class="number">2</span>
                <div class="item-text">
                  <p>Proyecto Carretera Norte</p>
                  <span>2 usuarios • 3 capas</span>
                </div>
             </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="card panel status-panel">
          <h3>Estado del Sistema</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-dot online"></span>
              <span>Sistema Operativo</span>
            </div>
            <div class="status-item">
              <span class="status-dot online"></span>
              <span>Base de Datos Conectada</span>
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
    .active-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .active-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .active-item .number {
      width: 30px;
      height: 30px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }
    .item-text p {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .item-text span {
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
export class AdminDashboardComponent { }
