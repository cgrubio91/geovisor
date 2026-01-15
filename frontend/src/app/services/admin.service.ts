import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    // SE QUITA LA BARRA FINAL AQUÍ
    private apiUrl = 'http://localhost:8000/api/v1/admin';

    constructor(private http: HttpClient) { }

    getStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    createUser(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users`, user);
    }

    updateUser(id: number, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/${id}`, user);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
    }

    getProjectsSummary(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/projects-summary`);
    }
}