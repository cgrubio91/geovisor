import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LayerService {
    private apiUrl = 'http://localhost:8000/api/v1/layers';

    constructor(private http: HttpClient) { }

    getLayers(projectId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${projectId}`);
    }

    getLayer(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/layer/${id}`);
    }

    createLayer(layer: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, layer);
    }

    updateLayer(id: number, layer: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/layer/${id}`, layer);
    }

    deleteLayer(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/layer/${id}`);
    }
}
