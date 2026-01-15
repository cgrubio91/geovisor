import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    // SE QUITA LA BARRA FINAL AQUÍ
    private apiUrl = 'http://localhost:8000/api/v1/projects';

    constructor(private http: HttpClient) { }

    getProjects(): Observable<any[]> {
        // Agregamos / al final para evitar el redirect 307 de FastAPI
        return this.http.get<any[]>(`${this.apiUrl}/`);
    }

    getProject(id: number): Observable<any> {
        // Antes era ${this.apiUrl}/${id} lo que causaba //id
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    createProject(project: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/`, project);
    }

    updateProject(id: number, project: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, project);
    }

    deleteProject(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}