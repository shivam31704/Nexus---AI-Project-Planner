import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SidebarItem {
  label: string;
  icon: string; // simple path id, rendered via [ngSwitch] below
  active?: boolean;
}

interface ProjectRow {
  id: string;
  name: string;
  percent: number;
  owner: string;
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
  tasks: number;
  phases: number;
  issues: number;
}

/**
 * Static UI shell — no backend wiring yet, per request. Structural pattern
 * (sidebar nav + top tab bar + data table + floating quick-start widget)
 * modeled after common PM-tool dashboards, restyled entirely in Nexus's
 * own glass/gradient design language rather than any third-party branding.
 */
@Component({
  selector: 'nexus-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  sidebarSections: { title: string; items: SidebarItem[] }[] = [
    {
      title: '',
      items: [
        { label: 'Home', icon: 'home' },
        { label: 'Projects', icon: 'projects', active: true },
        { label: 'Users', icon: 'users' },
        { label: 'Collaboration', icon: 'chat' },
        { label: 'My Approvals', icon: 'check' },
      ],
    },
    {
      title: 'Overview',
      items: [
        { label: 'Tasks', icon: 'task' },
        { label: 'Issues', icon: 'issue' },
        { label: 'Phases', icon: 'phase' },
        { label: 'Time Logs', icon: 'clock' },
        { label: 'Timesheets', icon: 'sheet' },
      ],
    },
  ];

  projectTabs = ['Active Projects', 'Project Templates', 'Project Groups', 'Public Projects', 'Archived Projects'];
  activeTab = 'Active Projects';

  columns = ['ID', 'Project Name', '%', 'Owner', 'Status', 'Tasks', 'Phases', 'Issues'];

  // Empty by design for now — this is the static UI pass, real data comes
  // once this is wired to the generation pipeline.
  projects: ProjectRow[] = [];

  quickStartSteps = [
    'Kickstart Your Project',
    'Add Tasks and Get Moving',
    'Visualize Work with Gantt Charts',
    'Log Time and Boost Productivity',
    'Manage Deadlines with Calendar',
    'Automate Repetitive Work',
    'Customize It Your Way',
    'Configure Your Workspace',
    'Bring Your Team Onboard',
  ];
  quickStartProgress = 0;
  quickStartMinimized = false;

  // Sidebar: open by default on desktop, closed by default on mobile/tablet
  // (avoids a drawer covering the whole screen on first load on a phone).
  isMobile = false;
  sidebarOpen = true;

  constructor() {
    this.updateBreakpoint();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateBreakpoint();
  }

  private updateBreakpoint() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 900;
    // Only auto-adjust when crossing the breakpoint, so a manual
    // open/close choice isn't overridden by every resize tick.
    if (this.isMobile !== wasMobile) {
      this.sidebarOpen = !this.isMobile;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
