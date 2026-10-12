/**
 * FoodBridge - Donate Food Form Controller
 * Validates fields, handles photo upload & thumbnail generation,
 * saves to localStorage via Storage API, and triggers celebratory modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDonationForm();
});

let currentUploadedPhotoData = null;

function initDonationForm() {
  const form = document.getElementById('donation-form');
  const photoInput = document.getElementById('food-photo-input');
  const dropzone = document.getElementById('upload-dropzone');
  const previewContainer = document.getElementById('photo-preview-container');
  const previewImg = document.getElementById('photo-preview-img');
  const removePhotoBtn = document.getElementById('remove-photo-btn');
  const samplePhotoBtn = document.getElementById('use-sample-photo-btn');

  // Pre-fill current date/time in the prep-time field
  const prepTimeInput = document.getElementById('prep-time');
  if (prepTimeInput) {
    const now = new Date();
    // Format YYYY-MM-DDTHH:MM
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    prepTimeInput.value = localIso;
  }

  // Handle Photo File Select via Input
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        processUploadedImage(file);
      }
    });
  }

  // Drag and drop events
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processUploadedImage(files[0]);
      }
    });
  }

  // Remove Photo handler
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      currentUploadedPhotoData = null;
      if (photoInput) photoInput.value = '';
      previewContainer.style.display = 'none';
      dropzone.style.display = 'block';
    });
  }

  // Use Quick Sample Photo Helper (convenient for hackathon demonstrations)
  if (samplePhotoBtn) {
    samplePhotoBtn.addEventListener('click', () => {
      const samplePhotos = [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80'
      ];
      const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
      currentUploadedPhotoData = randomPhoto;
      previewImg.src = randomPhoto;
      previewContainer.style.display = 'block';
      dropzone.style.display = 'none';
      clearFieldError('food-photo-input');
      showToast('Sample food photograph loaded!', 'info');
    });
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateDonationForm()) {
        submitDonation();
      }
    });
  }
}

// Process and compress image to base64 canvas to safeguard localStorage capacity
function processUploadedImage(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload a valid image file (PNG, JPG, JPEG, WEBP)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Resize to max 600px width/height to avoid localStorage quota issues
      const maxDim = 600;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      currentUploadedPhotoData = canvas.toDataURL('image/jpeg', 0.75);

      const previewContainer = document.getElementById('photo-preview-container');
      const previewImg = document.getElementById('photo-preview-img');
      const dropzone = document.getElementById('upload-dropzone');

      previewImg.src = currentUploadedPhotoData;
      previewContainer.style.display = 'block';
      dropzone.style.display = 'none';

      clearFieldError('food-photo-input');
      showToast('Food photograph uploaded and preview ready! 📸', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Form validation across all 11 fields
function validateDonationForm() {
  let isValid = true;

  const donorName = document.getElementById('donor-name');
  const orgName = document.getElementById('org-name');
  const contactPhone = document.getElementById('contact-phone');
  const pickupLocation = document.getElementById('pickup-location');
  const foodItems = document.getElementById('food-items');
  const quantityKg = document.getElementById('quantity-kg');
  const peopleServed = document.getElementById('people-served');
  const prepTime = document.getElementById('prep-time');
  const reason = document.getElementById('donation-reason');

  // 1. Donor Name
  if (!donorName.value.trim() || donorName.value.trim().length < 2) {
    showFieldError('donor-name', 'Please enter your full name (minimum 2 characters).');
    isValid = false;
  } else {
    clearFieldError('donor-name');
  }

  // 2. Organization Name
  if (!orgName.value.trim()) {
    showFieldError('org-name', 'Please provide hotel, caterer, or banquet organization name.');
    isValid = false;
  } else {
    clearFieldError('org-name');
  }

  // 3. Contact Phone (10 digits)
  const phoneClean = contactPhone.value.replace(/\D/g, '');
  if (!phoneClean || phoneClean.length < 10) {
    showFieldError('contact-phone', 'Please enter a valid 10-digit contact number.');
    isValid = false;
  } else {
    clearFieldError('contact-phone');
  }

  // 4. Pickup Location
  if (!pickupLocation.value.trim() || pickupLocation.value.trim().length < 5) {
    showFieldError('pickup-location', 'Please enter exact address or branch for our pickup crew.');
    isValid = false;
  } else {
    clearFieldError('pickup-location');
  }

  // 5. Food Items
  if (!foodItems.value.trim() || foodItems.value.trim().length < 3) {
    showFieldError('food-items', 'Please specify available food items (e.g. Rice, Curry, Bread).');
    isValid = false;
  } else {
    clearFieldError('food-items');
  }

  // 6. Food Quantity in KG
  const qty = parseFloat(quantityKg.value);
  if (isNaN(qty) || qty <= 0) {
    showFieldError('quantity-kg', 'Quantity must be greater than 0 KG.');
    isValid = false;
  } else {
    clearFieldError('quantity-kg');
  }

  // 7. Estimated People Served
  const people = parseInt(peopleServed.value, 10);
  if (isNaN(people) || people <= 0) {
    showFieldError('people-served', 'Estimated beneficiaries must be at least 1 person.');
    isValid = false;
  } else {
    clearFieldError('people-served');
  }

  // 8. Preparation Date & Time
  if (!prepTime.value) {
    showFieldError('prep-time', 'Please specify when the food was prepared.');
    isValid = false;
  } else {
    clearFieldError('prep-time');
  }

  // 9. Photo upload (If not uploaded, assign an attractive fallback culinary photo)
  if (!currentUploadedPhotoData) {
    currentUploadedPhotoData = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
  }

  // 10. Donation Reason
  if (!reason.value) {
    showFieldError('donation-reason', 'Please select a donation reason.');
    isValid = false;
  } else {
    clearFieldError('donation-reason');
  }

  return isValid;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('is-invalid');
  const errorElem = document.getElementById(`${fieldId}-error`);
  if (errorElem) {
    errorElem.textContent = message;
    errorElem.style.display = 'block';
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('is-invalid');
  const errorElem = document.getElementById(`${fieldId}-error`);
  if (errorElem) {
    errorElem.style.display = 'none';
  }
}

// Submit Donation and save into LocalStorage
function submitDonation() {
  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing & Saving...';

  const donationData = {
    donorName: document.getElementById('donor-name').value.trim(),
    orgName: document.getElementById('org-name').value.trim(),
    phone: document.getElementById('contact-phone').value.trim(),
    pickupLocation: document.getElementById('pickup-location').value.trim(),
    foodItems: document.getElementById('food-items').value.trim(),
    quantityKg: parseFloat(document.getElementById('quantity-kg').value),
    peopleServed: parseInt(document.getElementById('people-served').value, 10),
    prepDateTime: document.getElementById('prep-time').value,
    photoUrl: currentUploadedPhotoData,
    reason: document.getElementById('donation-reason').value,
    notes: document.getElementById('additional-notes').value.trim() || 'No special handling instructions provided.'
  };

  setTimeout(() => {
    try {
      // Save in localStorage via Storage singleton
      const savedDonation = Storage.addDonation(donationData);

      // Open Success Modal
      displaySuccessModal(savedDonation);

      // Reset form
      document.getElementById('donation-form').reset();
      currentUploadedPhotoData = null;
      document.getElementById('photo-preview-container').style.display = 'none';
      document.getElementById('upload-dropzone').style.display = 'block';

      showToast(`Donation request #${savedDonation.id} logged successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving donation. Please retry.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }, 400);
}

// Display the animated Success Modal with exact required wording
function displaySuccessModal(donation) {
  const modal = document.getElementById('donation-success-modal');
  if (!modal) return;

  document.getElementById('modal-donation-id').textContent = donation.id;
  document.getElementById('modal-donor-name').textContent = donation.donorName;
  document.getElementById('modal-food-summary').textContent = `${donation.quantityKg} KG (${donation.foodItems})`;
  document.getElementById('modal-people-est').textContent = `${donation.peopleServed} People`;

  modal.classList.add('show');
}

function closeSuccessModal() {
  const modal = document.getElementById('donation-success-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}
