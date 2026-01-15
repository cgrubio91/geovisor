import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../../services/file.service';
import { ProjectService } from '../../../services/project.service';

@Component({
    selector: 'app-admin-files',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="files-container">
      <div class="list-header">
        <h2>Gestión de Archivos y Capas</h2>
      </div>

      <div class="grid-layout">
        <!-- Upload Section -->
        <div class="card panel">
          <h3>Subir Nuevo Archivo</h3>
          <div class="form-group">
            <label>Proyecto Destino</label>
            <select [(ngModel)]="selectedProjectId" class="form-control">
              <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Seleccionar Archivo</label>
            <input type="file" (change)="onFileSelected($event)" class="form-control">
          </div>

          <button class="btn btn-primary" (click)="uploadFile()" [disabled]="!selectedFile || !selectedProjectId">
            Subir y Crear Capa
          </button>
          
          <div *ngIf="uploadStatus" class="status-msg" [class.success]="uploadStatus.includes('éxito')">
            {{ uploadStatus }}
          </div>
        </div>

        <!-- Import Local Section -->
        <div class="card panel">
          <h3>Importar desde carpeta 'Datos'</h3>
          <div class="form-group">
             <label>Proyecto Destino</label>
             <select [(ngModel)]="selectedProjectIdImport" class="form-control">
               <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
             </select>
          </div>
          
          <div class="local-files-list">
             <div *ngFor="let file of localFiles" class="file-item">
               <span>{{ file }}</span>
               <button class="btn-sm" (click)="importFile(file)" [disabled]="!selectedProjectIdImport">Importar</button>
             </div>
             <p *ngIf="localFiles.length === 0" class="empty-msg">No se encontraron archivos en la carpeta Datos.</p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .panel {
      padding: 25px;
    }
    .panel h3 {
      font-size: 1.1rem;
      color: var(--secondary);
      margin-bottom: 20px;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: 10px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      font-weight: 500;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    .btn:disabled {
      background: var(--gray-200);
      cursor: not-allowed;
    }
    .btn-sm {
       background: var(--secondary);
       color: white;
       border: none;
       padding: 5px 10px;
       border-radius: 4px;
       cursor: pointer;
       font-size: 0.8rem;
    }
    .local-files-list {
       display: flex;
       flex-direction: column;
       gap: 10px;
    }
    .file-item {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 10px;
       background: #f5f5f5;
       border-radius: 6px;
    }
    .status-msg {
      margin-top: 15px;
      padding: 10px;
      background: #ffebee;
      color: #c62828;
      border-radius: 6px;
    }
    .status-msg.success {
      background: #e8f5e9;
      color: #2e7d32;
    }
  `]
})
export class AdminFilesComponent implements OnInit {
    projects: any[] = [];
    localFiles: string[] = [];

    selectedProjectId: number | null = null;
    selectedProjectIdImport: number | null = null;
    selectedFile: File | null = null;
    uploadStatus: string = '';

    constructor(
        private fileService: FileService,
        private projectService: ProjectService
    ) { }

    ngOnInit() {
        this.loadProjects();
        this.loadLocalFiles();
    }

    loadProjects() {
        this.projectService.getProjects().subscribe(data => {
            this.projects = data;
        });
    }

    loadLocalFiles() {
        this.fileService.listLocalFiles().subscribe(data => {
            this.localFiles = data;
        });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    uploadFile() {
        if (!this.selectedFile || !this.selectedProjectId) return;

        this.uploadStatus = 'Subiendo...';
        this.fileService.uploadFile(this.selectedProjectId, this.selectedFile).subscribe({
            next: (res) => {
                this.uploadStatus = 'Archivo subido con éxito y capa creada.';
                this.selectedFile = null;
            },
            error: (err) => {
                this.uploadStatus = 'Error al subir archivo.';
                console.error(err);
            }
        });
    }

    importFile(filename: string) {
        if (!this.selectedProjectIdImport) return;

        this.fileService.importLocalFile(filename, this.selectedProjectIdImport).subscribe({
            next: (res) => {
                alert(`Archivo ${filename} importado correctamente como capa.`);
            },
            error: (err) => {
                alert('Error al importar archivo.');
            }
        });
    }
}
