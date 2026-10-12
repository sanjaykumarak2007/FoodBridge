/**
 * FoodBridge - Admin Dashboard Controller
 * Handles donation review, Approve / Reject workflows, metrics calculation,
 * photo inspection modals, and sample data resets.
 */

let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
  renderAdminStats();
  renderAdminTable();

  // Cross-tab synchronization
  window.addEventListener('storage', () => {
    renderAdminStats();
    renderAdminTable();
  });

  window.addEventListener('foodbridge_data_updated', () => {
    renderAdminStats();
    renderAdminTable();
  });
});

function initAdminDashboard() {
  // Filter tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderAdminTable();
    });
  });

  // Search input
  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderAdminTable();
    });
  }

  // Quick Action Buttons
  const resetBtn = document.getElementById('reset-demo-data-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all demo data back to default initial state?')) {
        Storage.resetDemoData();
        renderAdminStats();
        renderAdminTable();
        showToast('Demo data reset to initial showcase state!', 'info');
      }
    });
  }

  const addSampleBtn = document.getElementById('add-sample-request-btn');
  if (addSampleBtn) {
    addSampleBtn.addEventListener('click', () => {
      addNewMockSampleRequest();
    });
  }
}

// Render Top Stats Cards
function renderAdminStats() {
  const stats = Storage.getStats();

  const totalEl = document.getElementById('stat-total-count');
  const pendingEl = document.getElementById('stat-pending-count');
  const approvedEl = document.getElementById('stat-approved-count');
  const rejectedEl = document.getElementById('stat-rejected-count');

  if (totalEl) totalEl.textContent = stats.total;
  if (pendingEl) pendingEl.textContent = stats.pending;
  if (approvedEl) approvedEl.textContent = stats.approved;
  if (rejectedEl) rejectedEl.textContent = stats.rejected;

  // Filter badge counts
  const tabPendingBadge = document.getElementById('tab-pending-badge');
  const tabApprovedBadge = document.getElementById('tab-approved-badge');
  const tabRejectedBadge = document.getElementById('tab-rejected-badge');
  const tabAllBadge = document.getElementById('tab-all-badge');

  if (tabAllBadge) tabAllBadge.textContent = stats.total;
  if (tabPendingBadge) tabPendingBadge.textContent = stats.pending;
  if (tabApprovedBadge) tabApprovedBadge.textContent = stats.approved;
  if (tabRejectedBadge) tabRejectedBadge.textContent = stats.rejected;
}

// Render Admin Table Rows
function renderAdminTable() {
  const tbody = document.getElementById('admin-requests-tbody');
  const emptyState = document.getElementById('admin-table-empty');
  if (!tbody) return;

  let donations = Storage.getAllDonations();

  // Apply Status Filter
  if (currentFilter !== 'all') {
    donations = donations.filter(d => d.status.toLowerCase() === currentFilter.toLowerCase());
  }

  // Apply Search Filter
  if (searchQuery) {
    donations = donations.filter(d => 
      (d.donorName && d.donorName.toLowerCase().includes(searchQuery)) ||
      (d.orgName && d.orgName.toLowerCase().includes(searchQuery)) ||
      (d.foodItems && d.foodItems.toLowerCase().includes(searchQuery)) ||
      (d.pickupLocation && d.pickupLocation.toLowerCase().includes(searchQuery)) ||
      (d.phone && d.phone.includes(searchQuery)) ||
      (d.id && d.id.toLowerCase().includes(searchQuery))
    );
  }

  if (donations.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = donations.map(d => {
    let badgeClass = 'badge-pending';
    let statusIcon = '<i class="fa-solid fa-hourglass-half"></i>';

    if (d.status === 'Approved') {
      badgeClass = 'badge-approved';
      statusIcon = '<i class="fa-solid fa-circle-check"></i>';
    } else if (d.status === 'Rejected') {
      badgeClass = 'badge-rejected';
      statusIcon = '<i class="fa-solid fa-circle-xmark"></i>';
    }

    const assignedCenter = d.assignedCenterId ? Storage.getCenterById(d.assignedCenterId) : null;
    const formattedPrep = formatDateTime(d.prepDateTime);

    return `
      <tr id="row-${d.id}">
        <td>
          <div style="font-family: monospace; font-weight: 700; color: var(--text-main);">${d.id}</div>
          <small style="color: var(--text-muted); font-size: 0.75rem;">${formatDateTime(d.createdAt)}</small>
        </td>

        <td>
          <div class="table-donor-meta">
            ${d.photoUrl ? `
              <img 
                src="${d.photoUrl}" 
                alt="Food photo" 
                class="table-food-thumb"
                onclick="openPhotoModal('${d.photoUrl}', '${escapeHtml(d.foodItems)}', '${d.id}')"
                title="Click to view photograph"
              >
            ` : `
              <div class="table-food-thumb" style="display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#94a3b8;">
                <i class="fa-solid fa-image"></i>
              </div>
            `}
            <div class="donor-info">
              <h5>${escapeHtml(d.donorName)}</h5>
              <small><i class="fa-solid fa-building"></i> ${escapeHtml(d.orgName)}</small>
              <small><i class="fa-solid fa-phone"></i> ${d.phone}</small>
            </div>
          </div>
        </td>

        <td>
          <strong style="color: var(--text-main); font-size: 0.95rem;">${escapeHtml(d.foodItems)}</strong>
          <div style="margin-top: 0.25rem;">
            <span class="badge badge-warning" style="font-size: 0.725rem;">${d.reason}</span>
            <span style="font-size: 0.775rem; color: var(--text-muted); margin-left: 0.35rem;">
              ${d.notes ? escapeHtml(d.notes.slice(0, 45) + (d.notes.length > 45 ? '...' : '')) : ''}
            </span>
          </div>
        </td>

        <td>
          <div style="font-weight: 700; font-family: 'Outfit', sans-serif; font-size: 1.15rem; color: var(--primary-dark);">
            ${d.quantityKg} KG
          </div>
          <small style="color: var(--secondary); font-weight: 600;">
            ~${d.peopleServed} Meals
          </small>
        </td>

        <td>
          <div style="max-width: 220px; font-size: 0.85rem; color: var(--text-body);">
            <i class="fa-solid fa-location-dot" style="color: var(--secondary); margin-right: 3px;"></i>
            ${escapeHtml(d.pickupLocation)}
          </div>
          <small style="color: var(--text-muted); display: block; margin-top: 0.25rem;">
            <i class="fa-solid fa-clock"></i> Prep: ${formattedPrep}
          </small>
        </td>

        <td>
          <span class="badge ${badgeClass}">
            ${statusIcon} ${d.status}
          </span>
          ${assignedCenter ? `
            <small style="display: block; margin-top: 0.35rem; color: #059669; font-weight: 600; font-size: 0.75rem;">
              <i class="fa-solid fa-van-shuttle"></i> ${assignedCenter.name.split(' ')[0]} Hub
            </small>
          ` : ''}
        </td>

        <td>
          <div class="table-actions">
            ${d.status === 'Pending' ? `
              <button 
                type="button" 
                class="btn btn-sm btn-primary" 
                onclick="handleApproveClick('${d.id}')"
                title="Approve request and broadcast to live board"
              >
                <i class="fa-solid fa-check"></i> Approve
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-outline" 
                style="border-color: #fca5a5; color: #dc2626;"
                onclick="handleRejectClick('${d.id}')"
                title="Reject request"
              >
                <i class="fa-solid fa-xmark"></i> Reject
              </button>
            ` : d.status === 'Approved' ? `
              <button 
                type="button" 
                class="btn btn-sm btn-outline" 
                style="border-color: #cbd5e1; color: #64748b;"
                onclick="handleRevertToPending('${d.id}')"
                title="Change status back to pending"
              >
                <i class="fa-solid fa-rotate-left"></i> Re-evaluate
              </button>
              <a 
                href="locations.html#digital-board" 
                class="btn btn-sm btn-yellow" 
                title="View on live digital board"
              >
                <i class="fa-solid fa-tv"></i> Live Board
              </a>
            ` : `
              <button 
                type="button" 
                class="btn btn-sm btn-primary" 
                onclick="handleApproveClick('${d.id}')"
                title="Re-approve this request"
              >
                <i class="fa-solid fa-check"></i> Re-Approve
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Action Handlers
function handleApproveClick(id) {
  // Open approval center selection modal or direct assign
  openApprovalModal(id);
}

function handleRejectClick(id) {
  if (confirm(`Are you sure you want to REJECT donation request ${id}? It will NOT appear on the public digital board.`)) {
    Storage.updateStatus(id, 'Rejected');
    renderAdminStats();
    renderAdminTable();
    showToast(`Donation ${id} rejected.`, 'info');
  }
}

function handleRevertToPending(id) {
  Storage.updateStatus(id, 'Pending');
  renderAdminStats();
  renderAdminTable();
  showToast(`Donation ${id} moved back to Pending.`, 'info');
}

// Center Assignment Modal
let pendingApprovalDonationId = null;

function openApprovalModal(id) {
  pendingApprovalDonationId = id;
  const modal = document.getElementById('approval-center-modal');
  const modalIdEl = document.getElementById('modal-approve-target-id');
  if (modalIdEl) modalIdEl.textContent = id;
  if (modal) modal.classList.add('show');
}

function closeApprovalModal() {
  const modal = document.getElementById('approval-center-modal');
  if (modal) modal.classList.remove('show');
  pendingApprovalDonationId = null;
}

function confirmApproval() {
  if (!pendingApprovalDonationId) return;

  const centerSelect = document.getElementById('approve-center-select');
  const selectedCenter = centerSelect ? centerSelect.value : 'center-1';

  Storage.updateStatus(pendingApprovalDonationId, 'Approved', selectedCenter);
  closeApprovalModal();
  renderAdminStats();
  renderAdminTable();

  const centerObj = Storage.getCenterById(selectedCenter);
  showToast(`🎉 Request ${pendingApprovalDonationId} Approved & Dispatched to ${centerObj.name}! Live on Digital Board 📡`, 'success');
}

// Photo Preview Modal
function openPhotoModal(url, foodTitle, id) {
  const modal = document.getElementById('photo-inspect-modal');
  const img = document.getElementById('inspect-photo-img');
  const title = document.getElementById('inspect-food-title');
  const idEl = document.getElementById('inspect-food-id');

  if (img) img.src = url;
  if (title) title.textContent = foodTitle;
  if (idEl) idEl.textContent = id;

  if (modal) modal.classList.add('show');
}

function closePhotoModal() {
  const modal = document.getElementById('photo-inspect-modal');
  if (modal) modal.classList.remove('show');
}

// Quick Sample Generator (Helpful for Live Demo / Judges)
function addNewMockSampleRequest() {
  const mockOptions = [
    {
      donorName: 'Chef Ananya Roy',
      orgName: 'Novotel Grand Bay',
      phone: '9845112233',
      pickupLocation: 'Kitchen Service Ramp, Sector 12',
      foodItems: 'Veg Hakka Noodles, Manchurian Gravy, Fried Rice',
      quantityKg: 20,
      peopleServed: 50,
      prepDateTime: new Date().toISOString().slice(0, 16),
      photoUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      reason: 'Hotel Surplus',
      notes: 'Buffet surplus, temperature checked at 68°C when packed.'
    },
    {
      donorName: 'Amit Kapoor',
      orgName: 'Silver Palms Wedding Resort',
      phone: '9819223344',
      pickupLocation: 'Lawn 1 Catering Tent, Airport Highway',
      foodItems: 'Shahi Paneer, Butter Naan, Gulab Jamun, Jeera Pulao',
      quantityKg: 45,
      peopleServed: 110,
      prepDateTime: new Date().toISOString().slice(0, 16),
      photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      reason: 'Wedding',
      notes: 'Reception surplus food, prepared at 8 PM, neatly sealed.'
    }
  ];

  const randomSample = mockOptions[Math.floor(Math.random() * mockOptions.length)];
  const created = Storage.addDonation(randomSample);

  renderAdminStats();
  renderAdminTable();

  showToast(`Added new pending donation request ${created.id}! Ready for review.`, 'success');
}

// Utility: Escape HTML to avoid XSS in demo
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
