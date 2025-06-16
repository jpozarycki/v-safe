import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [HttpClient],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'dashboard';
  ngOnInit() {
    const cursor = document.getElementById('matrix-cursor');
    const trailContainer = document.getElementById('matrix-trail-container');

    document.addEventListener('mousemove', (e) => {
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }

      if (trailContainer) {
        const letter = document.createElement('div');
        letter.className = 'matrix-letter';
        letter.innerText = this.getRandomChar();

        // Use fixed position relative to the viewport
        letter.style.position = 'fixed';
        letter.style.left = `${e.clientX}px`;
        letter.style.top = `${e.clientY}px`;
        letter.style.color = 'lime';

        trailContainer.appendChild(letter);

        setTimeout(() => {
          letter.style.top = '-2000px'
        }, 500)

        // Clean up after animation
        setTimeout(() => {
          if (letter.parentElement) {
            letter.parentElement.removeChild(letter);
          }
        }, 1000);
      }
    });
  }

  getRandomChar(): string {
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }
}
