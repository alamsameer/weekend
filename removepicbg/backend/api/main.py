from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from rembg import remove
import io
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/remove_background")
async def remove_background(file: UploadFile = File(...)):
    input_data = await file.read()
    output_data = remove(input_data)
    
    original_filename = file.filename
    name, ext = os.path.splitext(original_filename)
    new_filename = f"{name}_processed{ext}"
    
    # Create an in-memory byte stream for the processed image
    byte_stream = io.BytesIO(output_data)
    
    headers = {
        "Content-Disposition": f"attachment; filename={new_filename}"
    }
    
    return StreamingResponse(byte_stream, media_type="image/png", headers=headers)
