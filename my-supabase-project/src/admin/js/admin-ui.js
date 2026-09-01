// src/admin/js/admin-ui.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // Dashboard, Manage Users, and Reports dropdown toggles
    const dashToggle = document.getElementById('dashboard-toggle');
    const dashSub = document.getElementById('dashboard-sub');
    const manageUsersToggle = document.getElementById('manage-users-toggle');
    const manageUsersSub = document.getElementById('manage-users-sub');
    const reportsToggle = document.getElementById('reports-toggle');
    const reportsSub = document.getElementById('reports-sub');

    function closeOtherDropdowns(exceptToggle) {
      if (dashToggle && dashToggle !== exceptToggle && dashSub) {
        dashToggle.classList.remove('expanded');
        dashSub.classList.remove('open');
      }
      if (manageUsersToggle && manageUsersToggle !== exceptToggle && manageUsersSub) {
        manageUsersToggle.classList.remove('expanded');
        manageUsersSub.classList.remove('open');
      }
      if (reportsToggle && reportsToggle !== exceptToggle && reportsSub) {
        reportsToggle.classList.remove('expanded');
        reportsSub.classList.remove('open');
      }
    }
    
    if (dashToggle && dashSub) {
      dashToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpening = !dashSub.classList.contains('open');
        if (isOpening) closeOtherDropdowns(dashToggle);
        dashToggle.classList.toggle('expanded');
        dashSub.classList.toggle('open');
      });
    }

    if (manageUsersToggle && manageUsersSub) {
      manageUsersToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpening = !manageUsersSub.classList.contains('open');
        if (isOpening) closeOtherDropdowns(manageUsersToggle);
        manageUsersToggle.classList.toggle('expanded');
        manageUsersSub.classList.toggle('open');
      });
    }

    if (reportsToggle && reportsSub) {
      reportsToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpening = !reportsSub.classList.contains('open');
        if (isOpening) closeOtherDropdowns(reportsToggle);
        reportsToggle.classList.toggle('expanded');
        reportsSub.classList.toggle('open');
      });
    }

    // --- Tab Switching Logic ---
    const panels = { analytics: 'panel-analytics', sales: 'panel-sales', 'manage-users': 'panel-manage-users', communications: 'panel-communications' };
    const headerTitle = document.querySelector('.page-title');
    const panelTitles = { analytics: 'Analytics', sales: 'Sales', 'manage-users': 'Manage Users', communications: 'Communications' };

    function showPanel(name) {
      Object.values(panels).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      const target = document.getElementById(panels[name]);
      if (target) target.style.display = 'block';
      if (headerTitle) headerTitle.textContent = panelTitles[name] || name;
    }

    if (dashSub && dashToggle) {
      dashSub.querySelectorAll('.nav-sub-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
          // If we are on dashboard.html, handle panel switching
          if (document.getElementById('panel-analytics')) {
            e.preventDefault();
            dashSub.querySelectorAll('.nav-sub-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            dashToggle.classList.add('active');
            showPanel(item.dataset.panel || item.textContent.toLowerCase());
          }
          // Otherwise, allow normal link navigation to dashboard.html
        });
      });
    }

    // Top-level Communications tab click
    const navComms = document.getElementById('nav-communications');
    if (navComms && document.getElementById('panel-communications')) {
      navComms.addEventListener('click', function(e) {
        e.preventDefault();
        closeOtherDropdowns(null);
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-sub-item').forEach(el => el.classList.remove('active'));
        navComms.classList.add('active');
        showPanel('communications');
      });

      if (window.location.hash === '#communications') {
        navComms.click();
      }
    }

});
