import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnalysisService {
    private apiUrl = 'http://localhost:8000/api/v1/analysis';

    constructor(private http: HttpClient) { }

    getProfile(layerId: number, geometry: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/profile?layer_id=${layerId}`, geometry);
    }

    calculateVolume(baseLayerId: number, geometry: any, designLayerId?: number): Observable<any> {
        let url = `${this.apiUrl}/volume?base_layer_id=${baseLayerId}`;
        if (designLayerId) url += `&design_layer_id=${designLayerId}`;
        return this.http.post<any>(url, geometry);
    }

    exportReport(projectId: number, format: 'pdf' | 'excel'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/report/${projectId}?format=${format}`, {
            responseType: 'blob'
        });
    }
}
