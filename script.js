document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imageForm');
    const canvas = document.getElementById('paymentCanvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');

    // New elements for status control
    const statusSelect = document.getElementById('status');
    const statusMessageGroup = document.getElementById('statusMessageGroup');
    const statusMessageInput = document.getElementById('status_message');

    // --- Color Definitions (Approximated from image) ---
    const bgColor = '#FFFFFF'; // White
    const textColorDark = '#333333'; // Dark grey for primary text
    const textColorLight = '#808080'; // Medium grey for secondary text/labels
    const redColor = '#E74C3C'; // A slightly softer red
    const whiteColor = '#FFFFFF'; // Pure white

    // --- Font Definitions (Adjusted sizes and weights based on visual inspection) ---
    // Note: 'Arial' is a common system font. For exact matches, you'd embed custom fonts
    // and use their names here (e.g., 'CustomFontBold').
    const fontM = 'bold 75px "Helvetica Neue", Helvetica, Arial, sans-serif'; // For the 'M'
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
        } else {
            statusMessageGroup.style.display = 'none';
            statusMessageInput.removeAttribute('required');
            statusMessageInput.value = ''; // Clear message if not canceled
        }
    };

    // Initial check and add event listener for status select
    toggleStatusMessageInput(); // Set initial state
    statusSelect.addEventListener('change', toggleStatusMessageInput);


    // Main drawing function
    const drawImage = (data) => {
        // Clear canvas for fresh drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Image Dimensions ---
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Set background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, imgWidth, imgHeight);

        // --- Top Section: 'M' avatar and names ---
        // Draw red circle for 'M'
        const circleRadius = 60;
        const circleCenterX = imgWidth / 2;
        const circleCenterY = 120; // Adjusted Y for better top margin
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
        ctx.fillStyle = redColor;
        ctx.fill();

        // Draw 'M' text inside the circle
        ctx.font = fontM;
        ctx.fillStyle = whiteColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("M", circleCenterX, circleCenterY + 5); // Slight Y adjustment for visual centering

        // Recipient Name (Beneficiary Name)
        ctx.font = fontName;
        ctx.fillStyle = textColorDark;
        ctx.fillText(data.recipient_name, imgWidth / 2, 225); // Adjusted Y

        // Payment to cash tag
        ctx.font = fontPaymentTo;
        ctx.fillStyle = textColorLight;
        ctx.fillText(`Payment to $${data.recipient_tag}`, imgWidth / 2, 275); // Adjusted Y

        // --- Amount and Date ---
        const amountText = `$${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        ctx.font = fontAmount;
        ctx.fillStyle = textColorDark;
        ctx.fillText(amountText, imgWidth / 2, 390); // Adjusted Y

        ctx.font = fontDate;
        ctx.fillStyle = textColorLight;
        ctx.fillText(data.date_time, imgWidth / 2, 455); // Adjusted Y

        // --- Status Message (Conditional) ---
        if (data.status === 'canceled' && data.status_message.trim() !== '') {
            // Draw red exclamation mark icon (simplified for canvas)
            const exclamationX = imgWidth / 2;
            const exclamationY = 550; // Adjusted Y for better spacing
            ctx.beginPath();
            ctx.arc(exclamationX, exclamationY, 22, 0, Math.PI * 2); // Slightly larger circle
            ctx.fillStyle = redColor;
            ctx.fill();

            // Draw '!' inside the circle
            ctx.font = 'bold 36px Arial, sans-serif'; // Specific font for '!'
            ctx.fillStyle = whiteColor;
            ctx.fillText("!", exclamationX, exclamationY + 3); // Fine-tune position

            // Status text
            ctx.font = fontStatusMsg;
            ctx.fillStyle = textColorDark;
            // Split the message if it contains "and" for multi-line display
            const statusParts = data.status_message.split('and');
            if (statusParts.length > 1) {
                ctx.fillText(statusParts[0].trim(), imgWidth / 2, 605); // Adjusted Y
                ctx.fillText("and " + statusParts[1].trim(), imgWidth / 2, 645); // Adjusted Y
            } else {
                ctx.fillText(data.status_message, imgWidth / 2, 605); // Single line
            }
        }

        // --- Bottom Details ---
        // Reset text alignment for the detailed section
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic'; // Reset text baseline to default for general text

        const leftX = 100;
        const rightX = imgWidth - 100; // Consistent right padding
        const startYBottom = 750;
        const lineHeight = 40; // Adjusted line height for tighter spacing

        // Left aligned labels
        ctx.font = fontLabel;
        ctx.fillStyle = textColorLight;
        ctx.fillText("Amount", leftX, startYBottom);
        ctx.fillText("Source", leftX, startYBottom + lineHeight);
        ctx.fillText("Identifier", leftX, startYBottom + 2 * lineHeight);
        ctx.fillText("To", leftX, startYBottom + 3 * lineHeight);
        ctx.fillText("From", leftX, startYBottom + 4 * lineHeight);

        // Right aligned values
        ctx.textAlign = 'right'; // Change alignment for values
        ctx.fillStyle = textColorDark;
        ctx.fillText(amountText, rightX, startYBottom);
        ctx.fillText(data.source_bank, rightX, startYBottom + lineHeight);
        ctx.fillText(data.identifier, rightX, startYBottom + 2 * lineHeight);
        ctx.fillText(data.recipient_name, rightX, startYBottom + 3 * lineHeight);
        ctx.fillText(data.sender_name, rightX, startYBottom + 4 * lineHeight);

        // Show download button
        downloadBtn.style.display = 'block';
    };

    // Event listener for form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission (page reload)

        // Gather data from the form
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

        // Draw the image with the collected data
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

    // Initial draw on page load with default form values
    form.dispatchEvent(new Event('submit'));
});
