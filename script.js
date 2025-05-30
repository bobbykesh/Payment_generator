document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const canvas = document.getElementById('paymentCanvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');

    const statusSelect = document.getElementById('status');
    const profileImageInput = document.getElementById('profile_image');
    let uploadedProfileImage = null;

    // --- Default Canceled Message ---
    // This message will be used whenever the status is set to 'canceled'
    const defaultCanceledMessage = "This payment was canceled for your protection and was refunded";

    // --- Color Definitions ---
    const bgColor = '#FFFFFF';
    const textColorDark = '#333333';
    const textColorLight = '#808080';
    const redColor = '#E74C3C';
    const whiteColor = '#FFFFFF';

    // --- Font Definitions ---
    const fontCircleChar = 'bold 75px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const fontName = 'bold 36px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const fontPaymentTo = '30px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const fontAmount = 'bold 70px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const fontDate = '28px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const fontStatusMsg = '28px "Helvetica Neue", Helvetica, Arial, sans-serif'; // Still used for default message
    const fontLabel = '24px "Helvetica Neue", Helvetica, Arial, sans-serif';
    const fontValue = '24px "Helvetica Neue", Helvetica, Arial, sans-serif';

    // The toggleStatusMessageInput function is no longer needed as the input is removed
    // We will no longer dynamically show/hide a textarea for the message.

    // Event listener for profile image upload
    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedProfileImage = img;
                    form.dispatchEvent(new Event('submit')); // Re-draw
                };
                img.onerror = () => {
                    console.error("Failed to load image.");
                    uploadedProfileImage = null;
                    form.dispatchEvent(new Event('submit')); // Re-draw
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            uploadedProfileImage = null;
            form.dispatchEvent(new Event('submit')); // Re-draw
        }
    });

    // Event listener for status change (to trigger immediate re-draw if 'canceled' is selected)
    statusSelect.addEventListener('change', () => {
        form.dispatchEvent(new Event('submit'));
    });


    // Main drawing function
    const drawImage = (data) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        // --- Top Section: Profile Image/Initial and names ---
        const circleRadius = 60;
        const circleCenterX = imgWidth / 2;
        const circleCenterY = 120;

        if (uploadedProfileImage && uploadedProfileImage.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.clip();

            const imgRatio = uploadedProfileImage.width / uploadedProfileImage.height;
            const circleDiameter = circleRadius * 2;

            let drawX, drawY, drawWidth, drawHeight;

            if (imgRatio > 1) {
                drawHeight = circleDiameter;
                drawWidth = drawHeight * imgRatio;
                drawX = circleCenterX - (drawWidth / 2);
                drawY = circleCenterY - circleRadius;
            } else {
                drawWidth = circleDiameter;
                drawHeight = drawWidth / imgRatio;
                drawX = circleCenterX - circleRadius;
                drawY = circleCenterY - (drawHeight / 2);
            }

            ctx.drawImage(uploadedProfileImage, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = redColor;
            ctx.fill();

            const beneficiaryInitial = data.recipient_name ? data.recipient_name.charAt(0).toUpperCase() : '';
            ctx.font = fontCircleChar;
            ctx.fillStyle = whiteColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(beneficiaryInitial, circleCenterX, circleCenterY + 5);
        }

        // Recipient Name (Beneficiary Name)
        ctx.font = fontName;
        ctx.fillStyle = textColorDark;
        ctx.fillText(data.recipient_name, imgWidth / 2, 225);

        // Payment to cash tag
        ctx.font = fontPaymentTo;
        ctx.fillStyle = textColorLight;
        ctx.fillText(`Payment to $${data.recipient_tag}`, imgWidth / 2, 275);

        // --- Amount and Date ---
        const amountText = `$${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        ctx.font = fontAmount;
        ctx.fillStyle = textColorLight;
        ctx.fillText(amountText, imgWidth / 2, 390);

        ctx.font = fontDate;
        ctx.fillStyle = textColorLight;
        ctx.fillText(data.date_time, imgWidth / 2, 455);

        // --- Status Message (Conditional) ---
        // Now using the defaultCanceledMessage directly
        if (data.status === 'canceled') { // Check if status is 'canceled'
            const exclamationX = imgWidth / 2;
            const exclamationY = 550;
            ctx.beginPath();
            ctx.arc(exclamationX, exclamationY, 22, 0, Math.PI * 2);
            ctx.fillStyle = redColor;
            ctx.fill();

            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.fillStyle = whiteColor;
            ctx.fillText("!", exclamationX, exclamationY + 3);

            ctx.font = fontStatusMsg;
            ctx.fillStyle = textColorDark;
            // Use the defaultCanceledMessage directly
            const statusParts = defaultCanceledMessage.split('and');
            if (statusParts.length > 1) {
                ctx.fillText(statusParts[0].trim(), imgWidth / 2, 605);
                ctx.fillText("and " + statusParts[1].trim(), imgWidth / 2, 645);
            } else {
                ctx.fillText(defaultCanceledMessage, imgWidth / 2, 605);
            }
        }

        // --- Bottom Details ---
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        const leftX = 100;
        const rightX = imgWidth - 100;
        const startYBottom = 750;
        const lineHeight = 40;

        // Left aligned labels
        ctx.font = fontLabel;
        ctx.fillStyle = textColorLight;
        ctx.fillText("Amount", leftX, startYBottom);
        ctx.fillText("Source", leftX, startYBottom + lineHeight);
        ctx.fillText("Identifier", leftX, startYBottom + 2 * lineHeight);
        ctx.fillText("To", leftX, startYBottom + 3 * lineHeight);
        ctx.fillText("From", leftX, startYBottom + 4 * lineHeight);

        // Right aligned values
        ctx.textAlign = 'right';
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
            // status_message is no longer read from input, it's determined by 'status'
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

    // Initial draw on page load (now also sets initial status visibility)
    form.dispatchEvent(new Event('submit'));
});
