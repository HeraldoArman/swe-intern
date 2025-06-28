import os
import glob
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai
from pypdf import PdfReader


supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")

if not all([supabase_url, supabase_key, google_api_key]):
    print("supabase url", supabase_url)
    print("supabase key", supabase_key)
    print("google api key", google_api_key)
    raise EnvironmentError("Pastikan SUPABASE_URL, SUPABASE_KEY, dan GOOGLE_API_KEY")

# Inisialisasi klien Supabase dan Google AI
print("Menginisialisasi klien...")
supabase: Client = create_client(supabase_url, supabase_key)
genai.configure(api_key=google_api_key)
embedding_model = "text-embedding-004"

def split_text(text, chunk_size=1000, overlap=100):
    """Memecah teks menjadi bagian-bagian yang lebih kecil (chunks)."""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunks.append(text[i:i + chunk_size])
    return chunks

def main():
    print("Memulai proses ingestion data...")
    # Mencari semua file PDF di dalam folder materi/
    # Path 'materi/*.pdf' relatif dari root folder proyek
    pdf_files = glob.glob("materi/*.pdf")

    if not pdf_files:
        print("Tidak ada file PDF yang ditemukan di folder 'materi/'. Pastikan file sudah ada.")
        return

    for file_path in pdf_files:
        file_name = os.path.basename(file_path)
        print(f"\nMemproses file: {file_name}...")

        try:
            # Membaca dan mengekstrak teks dari PDF
            reader = PdfReader(file_path)
            full_text = "".join(page.extract_text() for page in reader.pages if page.extract_text())

            if not full_text.strip():
                print(f"  Peringatan: Tidak ada teks yang bisa diekstrak dari {file_name}.")
                continue

            # Memecah teks menjadi chunks
            text_chunks = split_text(full_text)
            print(f"  File dipecah menjadi {len(text_chunks)} chunks.")

            for i, chunk in enumerate(text_chunks):
                # Membuat embedding untuk setiap chunk
                print(f"  Membuat embedding untuk chunk {i+1}/{len(text_chunks)}...")
                embedding_result = genai.embed_content(
                    model=embedding_model,
                    content=chunk,
                    task_type="RETRIEVAL_DOCUMENT"
                )
                embedding = embedding_result['embedding']

                # Menyimpan data ke Supabase
                supabase.from_('documents').insert({
                    'content': chunk,
                    'embedding': embedding,
                    'metadata': {'fileName': file_name}
                }).execute()

        except Exception as e:
            print(f"  Terjadi error saat memproses file {file_name}: {e}")

    print("\nProses ingestion selesai!")

if __name__ == "__main__":
    main()