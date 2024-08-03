document.getElementById('uploadButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert('Please select a file first!');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:8000/remove_background', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to process the image');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        const processedImage = document.getElementById('processedImage');
        processedImage.src = imageUrl;
        processedImage.style.display = 'block';

        const downloadButton = document.getElementById('downloadButton');
        downloadButton.style.display = 'block';
        downloadButton.onclick = () => {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'processed_image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    } catch (error) {
        alert(error.message);
    }
});
