import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private apiUrl = 'http://localhost:8000/api/v1/files';

    constructor(private http: HttpClient) { }

    uploadFile(projectId: number, file: File, layerType?: string): Observable<any> {
        const formData = new FormData();
        formData.append('project_id', projectId.toString());
        formData.append('file', file);
        if (layerType) {
            formData.append('layer_type', layerType);
        }
        return this.http.post<any>(`${this.apiUrl}/upload`, formData);
    }

    listLocalFiles(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/list-local`);
    }

    importLocalFile(filename: string, projectId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/import-local`, null, {
            params: { filename, project_id: projectId.toString() }
        });
    }
}
