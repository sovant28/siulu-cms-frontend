const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('../.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY);

async function setupBucket() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;
    
    const bucketExists = buckets.some(b => b.name === 'cms-media');
    
    if (!bucketExists) {
      console.log('Creating bucket cms-media...');
      const { data, error } = await supabase.storage.createBucket('cms-media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });
      if (error) throw error;
      console.log('Bucket created successfully!');
    } else {
      console.log('Bucket cms-media already exists. Updating to public just in case...');
      await supabase.storage.updateBucket('cms-media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });
      console.log('Bucket is confirmed public.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

setupBucket();
