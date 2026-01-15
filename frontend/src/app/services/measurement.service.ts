import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MeasurementService {
    private apiUrl = 'http://localhost:8000/api/v1/measurements';

    constructor(private http: HttpClient) { }

    getMeasurements(projectId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${projectId}`);
    }

    getMeasurement(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/measurement/${id}`);
    }

    createMeasurement(measurement: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, measurement);
    }

    updateMeasurement(id: number, measurement: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/measurement/${id}`, measurement);
    }

    deleteMeasurement(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/measurement/${id}`);
    }
}
