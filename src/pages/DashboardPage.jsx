import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FullScreenViewer } from '../components/FullScreenViewer';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, profile } = useAuth();

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserImages();
    }
  }, [user]);

  const fetchUserImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select an image');
      return;
    }

    setUploading(true);

    try {
      // 1️⃣ Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2️⃣ Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // 3️⃣ Insert DB record
      const { error: dbError } = await supabase.from('images').insert({
        user_id: user.id,
        title,
        description,
        image_url: data.publicUrl,
      });

      if (dbError) throw dbError;

      setSuccess('Artwork uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchUserImages();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image) => {
    if (!confirm('Delete this image?')) return;

    try {
      // Delete from storage
      const path = image.image_url.split('/images/')[1];
      if (path) {
        await supabase.storage.from('images').remove([path]);
      }

      // Delete from DB
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      setImages(images.filter((img) => img.id !== image.id));
      setSuccess('Image deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-medium text-gray-900 dark:text-white mb-6 break-words">
          Welcome back, {profile?.full_name || profile?.username}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Upload className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Upload Artwork</h2>
              </div>

              {error && (
                <div className="mb-4 flex gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 text-green-600 text-sm">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Image *
                  </label>
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : (
                      <>
                        <ImageIcon className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to select image
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <textarea
                  rows={3}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Artwork'}
                </button>
              </form>
            </div>
          </div>

          {/* Images List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
              Your Artwork ({images.length})
            </h2>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No artwork yet
              </div>
            ) : (
              <div className="space-y-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{image.title || 'Untitled'}</h3>
                      <p className="text-sm text-gray-500">
                        {image.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(image)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <FullScreenViewer
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};


/* DashboardPage.jsx - Key handleSubmit logic */

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!file) {
    setError('Please select an image');
    return;
  }

  setUploading(true);

  try {
    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
       // If you see "Bucket not found" here, you MUST create it in the dashboard
       throw new Error(`Storage Error: ${uploadError.message}`);
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // 3. Insert Database record
    const { error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        title: title || 'Untitled',
        description: description || '',
        image_url: publicUrl,
      });

    if (dbError) throw new Error(`Database Error: ${dbError.message}`);

    setSuccess('Artwork uploaded successfully!');
    setTitle('');
    setDescription('');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchUserImages();

  } catch (err) {
    console.error("Upload process failed:", err);
    setError(err.message);
  } finally {
    setUploading(false);
  }
};
