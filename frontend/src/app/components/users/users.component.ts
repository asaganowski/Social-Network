import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User, UserWithMutualFriends } from '../../services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  friends: User[] = [];
  recommendations: UserWithMutualFriends[] = [];
  selectedUser: User | null = null;
  activeTab: 'friends' | 'recommendations' = 'friends';
  loading = false;

  newUser = {
    name: '',
    email: ''
  };

  friendship = {
    userId1: '',
    userId2: ''
  };

  message: { text: string; type: 'success' | 'error' | 'info' } | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Błąd podczas ładowania użytkowników', 'error');
        this.loading = false;
      }
    });
  }

  createUser() {
    this.api.createUser(this.newUser.name, this.newUser.email).subscribe({
      next: (user) => {
        this.users.unshift(user);
        this.newUser = { name: '', email: '' };
        this.showMessage('Użytkownik został dodany', 'success');
      },
      error: (err) => {
        this.showMessage('Błąd podczas dodawania użytkownika', 'error');
      }
    });
  }

  deleteUser(userId: string) {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      return;
    }

    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        if (this.selectedUser?.id === userId) {
          this.selectedUser = null;
        }
        this.showMessage('Użytkownik został usunięty', 'success');
      },
      error: (err) => {
        this.showMessage('Błąd podczas usuwania użytkownika', 'error');
      }
    });
  }

  createFriendship() {
    this.api.createFriendship(this.friendship.userId1, this.friendship.userId2).subscribe({
      next: () => {
        this.friendship = { userId1: '', userId2: '' };
        this.showMessage('Relacja znajomości została utworzona', 'success');
        if (this.selectedUser) {
          this.loadFriends();
        }
      },
      error: (err) => {
        this.showMessage('Błąd podczas tworzenia relacji', 'error');
      }
    });
  }

  viewUserDetails(user: User) {
    this.selectedUser = user;
    this.activeTab = 'friends';
    this.loadFriends();
  }

  loadFriends() {
    if (!this.selectedUser) return;

    this.api.getFriends(this.selectedUser.id).subscribe({
      next: (data) => {
        this.friends = data;
      },
      error: (err) => {
        this.showMessage('Błąd podczas ładowania znajomych', 'error');
      }
    });
  }

  loadRecommendations() {
    if (!this.selectedUser) return;

    this.api.getRecommendations(this.selectedUser.id).subscribe({
      next: (data) => {
        this.recommendations = data;
      },
      error: (err) => {
        this.showMessage('Błąd podczas ładowania rekomendacji', 'error');
      }
    });
  }

  removeFriendship(userId1: string, userId2: string) {
    if (!confirm('Czy na pewno chcesz usunąć tę relację?')) {
      return;
    }

    this.api.deleteFriendship(userId1, userId2).subscribe({
      next: () => {
        this.loadFriends();
        this.showMessage('Relacja została usunięta', 'success');
      },
      error: (err) => {
        this.showMessage('Błąd podczas usuwania relacji', 'error');
      }
    });
  }

  addFriendFromRecommendation(userId: string) {
    if (!this.selectedUser) return;

    this.api.createFriendship(this.selectedUser.id, userId).subscribe({
      next: () => {
        this.loadFriends();
        this.loadRecommendations();
        this.showMessage('Znajomy został dodany', 'success');
      },
      error: (err) => {
        this.showMessage('Błąd podczas dodawania znajomego', 'error');
      }
    });
  }

  showMessage(text: string, type: 'success' | 'error' | 'info') {
    this.message = { text, type };
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }
}
