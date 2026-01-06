import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = 'http://localhost:8000/api/v1/projects';

    constructor() { }

    getProject(id: number): Observable<any> {
        // Mock for now
        const projects = [
            { id: 1, name: 'Proyecto Carretera Norte', desc: 'Km 0+000 a Km 15+500' },
            { id: 2, name: 'Urbanización El Bosque', desc: '120 hectáreas' },
            { id: 3, name: 'Minería Santa Rita', desc: 'Cálculo de volúmenes' }
        ];
        return of(projects.find(p => p.id === id));
    }
}
