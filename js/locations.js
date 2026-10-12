/**
 * FoodBridge - Locations & Digital Food Availability Board Controller
 * Displays sample centers and approved donations dynamically from LocalStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLocationsPage();
  initDigitalBoardClock();
  renderDistributionCenters();
  renderDigitalBoard();

  // Listen for storage updates across tabs or within page
  window.addEventListener('storage', () => {
    renderDigitalBoard();
    updateCenterAvailabilityStats();
  });

  window.addEventListener('foodbridge_data_updated', () => {
    renderDigitalBoard();
    updateCenterAvailabilityStats();
  });
});

function initLocationsPage() {
  const filterSelect = document.getElementById('board-center-filter');
  const refreshBtn = document.getElementById('board-refresh-btn');
  const audioBtn = document.getElementById('board-audio-btn');

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      renderDigitalBoard(filterSelect.value);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      renderDigitalBoard(filterSelect ? filterSelect.value : 'all');
      showToast('Digital Board refreshed with latest data! 📡', 'info');
    });
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      playSimulatedAudioAnnouncement();
    });
  }
}

// Live Digital LED Clock for Outdoor Kiosk effect
function initDigitalBoardClock() {
  const clockElement = document.getElementById('digital-board-clock');
  if (!clockElement) return;

  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    clockElement.innerHTML = `<i class="fa-solid fa-clock"></i> ${dateStr} • ${timeStr} IST`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Render the 3 sample distribution centers
function renderDistributionCenters() {
  const container = document.getElementById('distribution-centers-grid');
  if (!container) return;

  const centers = Storage.getCenters();
  const approvedList = Storage.getApprovedDonations();

  container.innerHTML = centers.map(center => {
    // Calculate live surplus assigned to this center
    const centerDonations = approvedList.filter(d => d.assignedCenterId === center.id);
    const assignedMeals = centerDonations.reduce((sum, d) => sum + (Number(d.peopleServed) || 0), 0);
    const totalMealsAvailable = center.currentAvailableKg * 2.5 + assignedMeals;

    return `
      <div class="center-card">
        <div class="center-img-wrap">
          <img src="${center.image}" alt="${center.name}" class="center-img">
          <div class="center-status-floating">
            <span class="badge ${center.statusBadge}">
              <span class="pulse-dot"></span> ${center.status}
            </span>
          </div>
        </div>

        <div class="center-body">
          <h3 class="center-name">${center.name}</h3>
          
          <div class="center-address">
            <i class="fa-solid fa-location-dot"></i>
            <span>${center.address}</span>
          </div>

          <div class="center-meta">
            <div class="center-meta-item">
              <span>Operating Hours</span>
              <strong><i class="fa-solid fa-clock" style="color: var(--accent-yellow);"></i> ${center.operatingHours}</strong>
            </div>
            <div class="center-meta-item">
              <span>Current Availability</span>
              <strong style="color: var(--primary-dark);"><i class="fa-solid fa-utensils"></i> ~${Math.round(totalMealsAvailable)} Meals</strong>
            </div>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">
            <strong>Coordinator:</strong> ${center.coordinator} (${center.contact})
          </div>

          <div class="center-tags">
            ${center.facilities.map(f => `<span class="center-tag"><i class="fa-solid fa-check" style="color: var(--primary);"></i> ${f}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render approved food on the Digital Board
function renderDigitalBoard(centerFilter = 'all') {
  const boardGrid = document.getElementById('digital-board-grid');
  const countBadge = document.getElementById('board-active-count');
  if (!boardGrid) return;

  let approvedDonations = Storage.getApprovedDonations();

  if (centerFilter && centerFilter !== 'all') {
    approvedDonations = approvedDonations.filter(d => d.assignedCenterId === centerFilter);
  }

  if (countBadge) {
    countBadge.textContent = `${approvedDonations.length} Active Batches`;
  }

  if (approvedDonations.length === 0) {
    boardGrid.innerHTML = `
      <div class="board-empty-state">
        <i class="fa-solid fa-satellite-dish"></i>
        <h3 style="color: #cbd5e1; font-size: 1.3rem; margin-bottom: 0.5rem;">No Approved Food Batches Currently Broadcast</h3>
        <p style="max-width: 500px; margin: 0 auto 1.25rem; font-size: 0.9rem;">
          Donations must be reviewed and approved by the FoodBridge Admin crew before appearing on this public kiosk.
        </p>
        <a href="admin.html" class="btn btn-yellow btn-sm">
          <i class="fa-solid fa-lock-open"></i> Go to Admin Portal to Approve Requests
        </a>
      </div>
    `;
    return;
  }

  boardGrid.innerHTML = approvedDonations.map(donation => {
    const center = Storage.getCenterById(donation.assignedCenterId);
    const formattedPrep = formatDateTime(donation.prepDateTime);
    const donorDisplay = donation.orgName || donation.donorName;

    return `
      <div class="board-item-card">
        <div class="board-item-top">
          <span class="badge badge-success">
            <span class="pulse-dot"></span> Fresh & Ready
          </span>
          <span style="font-size: 0.75rem; color: #94a3b8; font-family: monospace;">${donation.id}</span>
        </div>

        <h4 class="board-item-food">${donation.foodItems}</h4>

        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.75rem;">
          <div class="board-item-qty">
            ${donation.quantityKg} <small>KG</small>
          </div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #fbbf24;">
            <i class="fa-solid fa-users"></i> Serves ~${donation.peopleServed}
          </div>
        </div>

        <div class="board-item-location">
          <i class="fa-solid fa-location-dot" style="color: var(--secondary);"></i>
          <span><strong>${center.name}</strong> • ${center.address.split(',')[1] || center.address}</span>
        </div>

        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem;">
          <i class="fa-solid fa-bowl-food" style="color: #34d399;"></i> Donor: <em>${donorDisplay}</em> (${donation.reason})
        </div>

        <div class="board-item-meta">
          <span><i class="fa-solid fa-clock"></i> Prepared: ${formattedPrep}</span>
          <span style="color: #34d399;"><i class="fa-solid fa-shield-heart"></i> Safety Verified</span>
        </div>
      </div>
    `;
  }).join('');
}

// Voice announcement simulation using Web Speech API (fallback to toast)
function playSimulatedAudioAnnouncement() {
  const approved = Storage.getApprovedDonations();
  if (approved.length === 0) {
    showToast('Voice Board: No active food batches currently available to announce.', 'info');
    return;
  }

  const firstBatch = approved[0];
  const center = Storage.getCenterById(firstBatch.assignedCenterId);
  const speechText = `Attention community members. Fresh warm food is available at ${center.name}. We have ${firstBatch.foodItems}, approximately ${firstBatch.quantityKg} kilograms for ${firstBatch.peopleServed} people. Everyone is welcome free of charge.`;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    showToast('🔊 Playing Community Board Public Voice Announcement...', 'info');
  } else {
    showToast(`🔊 Broadcast Announcement: "${speechText}"`, 'info');
  }
}

function updateCenterAvailabilityStats() {
  renderDistributionCenters();
}
