INSERT INTO public.courses (title, description, price, difficulty, duration_minutes, thumbnail_url, is_published)
VALUES 
('React Mastery', 'Master React 18 with TypeScript, Hooks, and modern patterns. Build real-world apps.', 49.99, 'intermediate', 1200, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', true),
('Web Development Bootcamp', 'The complete web development bootcamp. From HTML/CSS to Node.js.', 89.99, 'beginner', 2400, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80', true),
('Advanced CSS Animations', 'Create stunning animations and layouts with modern CSS features.', 29.99, 'advanced', 300, 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', true);

-- Insert lessons for React Mastery
DO $$
DECLARE
    v_course_id UUID;
BEGIN
    SELECT id INTO v_course_id FROM public.courses WHERE title = 'React Mastery' LIMIT 1;

    INSERT INTO public.lessons (course_id, title, order_index, video_url, content, duration_seconds, is_free)
    VALUES
    (v_course_id, 'Introduction to React', 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Welcome to the course! In this lesson we cover the basics.', 600, true),
    (v_course_id, 'Setting up Vite', 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Learn how to setup a fast React project with Vite.', 900, false),
    (v_course_id, 'Components and Props', 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Understanding the core building blocks of React.', 1200, false);
END $$;
