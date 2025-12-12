import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User, NetworkData, PathData } from '../../services/api.service';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {
  users: User[] = [];
  networkData: NetworkData | null = null;
  pathResult: PathData | null = null;
  pathError: string | null = null;

  pathSearch = {
    from: '',
    to: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadNetwork();
  }

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      }
    });
  }

  loadNetwork() {
    this.api.getNetwork().subscribe({
      next: (data) => {
        this.networkData = data;
      }
    });
  }

  findPath() {
    this.pathResult = null;
    this.pathError = null;

    this.api.getPath(this.pathSearch.from, this.pathSearch.to).subscribe({
      next: (data) => {
        this.pathResult = data;
      },
      error: (err) => {
        this.pathError = err.error?.error || 'Nie znaleziono ścieżki między użytkownikami';
      }
    });
  }
}
