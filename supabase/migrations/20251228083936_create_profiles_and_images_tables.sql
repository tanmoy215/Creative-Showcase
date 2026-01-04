-- 1. Allow the public to view any image in the 'images' bucket
CREATE POLICY "Public View Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- 2. Allow authenticated users to upload into their own folder
-- This matches your code: `const filePath = `${user.id}/${Date.now()}.${fileExt}`;`
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to delete only their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);


-- Remove old policies to prevent conflicts
DROP POLICY IF EXISTS "Users can insert own images" ON public.images;

-- Allow authenticated users to insert records into the images table
-- provided the user_id in the row matches their own ID
CREATE POLICY "Users can insert own images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure public/authenticated can view the records
DROP POLICY IF EXISTS "Anyone can view images" ON public.images;
CREATE POLICY "Anyone can view images"
ON public.images FOR SELECT
USING (true);



-- Allow authenticated users to upload to 'images' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow anyone to see images in the 'images' bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Ensure the 'images' table accepts uploads from the owner
DROP POLICY IF EXISTS "Users can insert own images" ON public.images;
CREATE POLICY "Users can insert own images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);