import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Friendship {
  userId1: string;
  userId2: string;
}

export interface UserWithMutualFriends extends User {
  mutualFriends: number;
}

export interface NetworkData {
  edges: { source: string; target: string; sourceName: string; targetName: string }[];
  stats: {
    totalUsers: number;
    friendshipCount: number;
    avgFriends: number;
    maxFriends: number;
    minFriends: number;
  };
}

export interface PathData {
  path: User[];
  distance: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(name: string, email: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, { name, email });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  getFriends(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/${userId}/friends`);
  }

  getRecommendations(userId: string): Observable<UserWithMutualFriends[]> {
    return this.http.get<UserWithMutualFriends[]>(`${this.baseUrl}/users/${userId}/recommendations`);
  }

  createFriendship(userId1: string, userId2: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/friendships`, { userId1, userId2 });
  }

  deleteFriendship(userId1: string, userId2: string): Observable<any> {
    return this.http.request('delete', `${this.baseUrl}/friendships`, {
      body: { userId1, userId2 }
    });
  }

  getNetwork(): Observable<NetworkData> {
    return this.http.get<NetworkData>(`${this.baseUrl}/network`);
  }

  getPath(fromUserId: string, toUserId: string): Observable<PathData> {
    return this.http.get<PathData>(`${this.baseUrl}/path?from=${fromUserId}&to=${toUserId}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }
}
