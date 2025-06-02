document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const canvas = document.getElementById('paymentCanvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');

    const statusSelect = document.getElementById('status');
    const statusMessageGroup = document.getElementById('statusMessageGroup');
    const statusMessageInput = document.getElementById('status_message');

    // Image Upload Elements
    const profileImageInput = document.getElementById('profile_image');
    const clearImageBtn = document.getElementById('clearImageBtn');
    let loadedProfileImage = null; // Variable to store the loaded image object

    // --- Color Definitions ---
    const bgColor = '#FFFFFF'; // White
    const textColorDark = '#333333'; // Dark grey for primary text (e.g., recipient name, bold amount)
    const textColorLight = '#808080'; // Medium grey for secondary text/labels (e.g., date, labels, values)
    const redColor = '#E74C3C'; // A slightly softer red
    const whiteColor = '#FFFFFF'; // Pure white

    // --- Font Definitions ---
    const fontCircleChar = 'bold 75px "Helvetica Neue", Helvetica, Arial, sans-serif'; // For the character in circle
    const fontName = 'bold 36px "Helvetica Neue", Helvetica, Arial, sans-serif'; // "Mekhia Dye"
    const fontPaymentTo = '30px "Helvetica Neue", Helvetica, Arial, sans-serif'; // "Payment to $khiaBoo826"
    const fontAmount = 'bold 70px "Helvetica Neue", Helvetica, Arial, sans-serif'; // "$1,000.00"
    const fontDate = '28px "Helvetica Neue", Helvetica, Arial, sans-serif'; // "May 21 at 12:52 pm"
    const fontStatusMsg = '28px "Helvetica Neue", Helvetica, Arial, sans-serif'; // "This payment was canceled..."
    const fontLabel = '24px "Helvetica Neue", Helvetica, Arial, sans-serif'; // Labels (Amount, Source, etc.)
    const fontValue = '24px "Helvetica Neue", Helvetica, Arial, sans-serif'; // Values on the right

    // Function to show/hide the status message input based on status selection
    const toggleStatusMessageInput = () => {
        if (statusSelect.value === 'canceled') {
            statusMessageGroup.style.display = 'block';
            statusMessageInput.setAttribute('required', 'required');
            // Set the default canceled message
            statusMessageInput.value = 'This payment was canceled for your protection and was refunded';
        } else {
            statusMessageGroup.style.display = 'none';
            statusMessageInput.removeAttribute('required');
            statusMessageInput.value = ''; // Clear message if not canceled
        }
        // Redraw the image immediately after status change
        form.dispatchEvent(new Event('submit'));
    };

    // Initial check and add event listener for status select
    toggleStatusMessageInput(); // Call once on load to set initial state and message
    statusSelect.addEventListener('change', toggleStatusMessageInput);

    // Handle Profile Image Upload
    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    loadedProfileImage = img;
                    form.dispatchEvent(new Event('submit')); // Redraw canvas with new image
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            loadedProfileImage = null; // Clear image if no file selected
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Handle Clear Image Button
    clearImageBtn.addEventListener('click', () => {
        loadedProfileImage = null; // Clear the loaded image
        profileImageInput.value = ''; // Clear the file input
        form.dispatchEvent(new Event('submit')); // Redraw canvas without the image
    });


    // Main drawing function
    const drawImage = (data) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        // --- Top Section: Image OR First alphabet in red circle and names ---
        const circleRadius = 60;
        const circleCenterX = imgWidth / 2;
        const circleCenterY = 120;

        if (loadedProfileImage) {
            const imageAspectRatio = loadedProfileImage.width / loadedProfileImage.height;
            const targetAspectRatio = 1; // We want to fit it within a circle (square aspect)
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = loadedProfileImage.width;
            let sourceHeight = loadedProfileImage.height;
            let drawWidth = circleRadius * 2;
            let drawHeight = circleRadius * 2;
            let drawX = circleCenterX - circleRadius;
            let drawY = circleCenterY - circleRadius;

            // Determine how to crop the source image to fit a square
            if (imageAspectRatio > targetAspectRatio) { // Image is wider than tall, crop horizontally
                sourceWidth = loadedProfileImage.height * targetAspectRatio;
                sourceX = (loadedProfileImage.width - sourceWidth) / 2;
            } else if (imageAspectRatio < targetAspectRatio) { // Image is taller than wide, crop vertically
                sourceHeight = loadedProfileImage.width / targetAspectRatio;
                sourceY = (loadedProfileImage.height - sourceHeight) / 2;
            }

            ctx.save(); // Save the current canvas state before applying the clip

            // Create a circular clipping path
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip(); // Apply the clipping path

            // Draw the image (it will be clipped to the circular shape)
            // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            ctx.drawImage(loadedProfileImage, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);

            ctx.restore(); // Restore the canvas state (removes the clipping path)

        } else {
            // Existing code for drawing red circle and black initial
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = redColor;
            ctx.fill();

            const beneficiaryInitial = data.recipient_name ? data.recipient_name.charAt(0).toUpperCase() : '';
            ctx.font = fontCircleChar;
            ctx.fillStyle = textColorDark; // Letter in circle is dark
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle'; // Set baseline to middle for vertical centering
            ctx.fillText(beneficiaryInitial, circleCenterX, circleCenterY); // Removed +5 offset
        }

        // Recipient Name (Beneficiary Name)
        ctx.font = fontName;
        ctx.fillStyle = textColorDark;
        ctx.textAlign = 'center'; // Ensure text remains centered
        ctx.fillText(data.recipient_name, imgWidth / 2, 225);

        // Payment to cash tag
        ctx.font = fontPaymentTo;
        ctx.fillStyle = textColorLight;
        ctx.textAlign = 'center'; // Ensure text remains centered
        ctx.fillText(`Payment to $${data.recipient_tag}`, imgWidth / 2, 275);

        // --- Amount and Date ---
        const amountText = `$${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        ctx.font = fontAmount;
        ctx.fillStyle = textColorLight; // Amount color is textColorLight
        ctx.textAlign = 'center'; // Ensure text remains centered
        ctx.fillText(amountText, imgWidth / 2, 390);

        ctx.font = fontDate;
        ctx.fillStyle = textColorLight;
        ctx.textAlign = 'center'; // Ensure text remains centered
        ctx.fillText(data.date_time, imgWidth / 2, 455);

        // --- Status Message (Conditional) ---
        if (data.status === 'canceled' && data.status_message.trim() !== '') {
            const exclamationX = imgWidth / 2;
            const exclamationY = 550;
            ctx.beginPath();
            ctx.arc(exclamationX, exclamationY, 22, 0, Math.PI * 2);
            ctx.fillStyle = redColor;
            ctx.fill();

            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.fillStyle = whiteColor;
            ctx.textAlign = 'center';     // Horizontal centering
            ctx.textBaseline = 'middle';  // Vertical centering
            ctx.fillText("!", exclamationX, exclamationY); // Removed '+3' offset

            ctx.font = fontStatusMsg;
            ctx.fillStyle = textColorDark;
            ctx.textAlign = 'center'; // Ensure text remains centered
            const part1 = "This payment was canceled for your protection";
            const part2 = "and was refunded";

            ctx.fillText(part1, imgWidth / 2, 605);
            ctx.fillText(part2, imgWidth / 2, 645);
        }

        // --- Bottom Details ---
        ctx.textAlign = 'left'; // Align labels to the left
        ctx.textBaseline = 'alphabetic';

        const leftX = 100;
        const rightX = imgWidth - 100;
        const startYBottom = 750;
        const lineHeight = 40;

        // Left aligned labels (remain textColorLight as they were)
        ctx.font = fontLabel;
        ctx.fillStyle = textColorLight;
        ctx.fillText("Amount", leftX, startYBottom);
        ctx.fillText("Source", leftX, startYBottom + lineHeight);
        ctx.fillText("Identifier", leftX, startYBottom + 2 * lineHeight);
        ctx.fillText("To", leftX, startYBottom + 3 * lineHeight);
        ctx.fillText("From", leftX, startYBottom + 4 * lineHeight);

        // Right aligned values (Color to textColorLight)
        ctx.textAlign = 'right'; // Align values to the right
        ctx.font = fontValue;
        ctx.fillStyle = textColorLight;
        ctx.fillText(amountText, rightX, startYBottom);
        ctx.fillText(data.source_bank, rightX, startYBottom + lineHeight);
        ctx.fillText(data.identifier, rightX, startYBottom + 2 * lineHeight);
        ctx.fillText(data.recipient_name, rightX, startYBottom + 3 * lineHeight);
        ctx.fillText(data.sender_name, rightX, startYBottom + 4 * lineHeight);

        downloadBtn.style.display = 'block';
    };

    // Event listener for form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            recipient_name: document.getElementById('recipient_name').value,
            recipient_tag: document.getElementById('recipient_tag').value,
            amount: document.getElementById('amount').value,
            date_time: document.getElementById('date_time').value,
            status: document.getElementById('status').value,
            status_message: document.getElementById('status_message').value,
            source_bank: document.getElementById('source_bank').value,
            identifier: document.getElementById('identifier').value,
            sender_name: document.getElementById('sender_name').value,
        };
        drawImage(formData);
    });

    // Event listener for download button
    downloadBtn.addEventListener('click', () => {
        const imageURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imageURL;
        a.download = 'payment_receipt.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Initial draw on page load based on current form values
    // This is handled by toggleStatusMessageInput() which dispatches a submit event
    // after setting up the initial state.
});
