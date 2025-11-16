/**
 * Script to generate sample blog posts for SEO content marketing
 *
 * Run this script with: npx ts-node scripts/generateSampleBlogPosts.ts
 * Or add to package.json: "generate-blog": "ts-node scripts/generateSampleBlogPosts.ts"
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample blog posts optimized for SEO
const sampleBlogPosts = [
  {
    title: '15 Best Summer Camps for Kids in 2026: A Parent\'s Complete Guide',
    slug: 'best-summer-camps-2026-parents-guide',
    excerpt: 'Discover the top summer camps for 2026, from STEM programs to outdoor adventures. Our comprehensive guide helps you find the perfect camp for your child.',
    seo_title: '15 Best Summer Camps for Kids in 2026 | FutureEdge Parent Guide',
    seo_description: 'Find the perfect summer camp for your child in 2026. Compare top-rated camps, read parent reviews, and discover programs for every interest and age group.',
    seo_keywords: 'best summer camps 2026, summer camps for kids, top summer programs, summer camp guide',
    category_slug: 'parent-guides',
    content: `
      <h2>Introduction</h2>
      <p>Choosing the right summer camp for your child is one of the most important decisions you'll make as a parent. With thousands of options available, it can be overwhelming to find a program that matches your child's interests, learning style, and your family's budget.</p>

      <p>In this comprehensive guide, we've researched and compiled the 15 best summer camps for 2026, covering everything from STEM programs to outdoor adventures, sports camps to arts programs.</p>

      <h2>How We Selected These Camps</h2>
      <p>Our selection process considered:</p>
      <ul>
        <li><strong>Safety standards</strong> - All camps are fully accredited with verified insurance and background-checked staff</li>
        <li><strong>Parent reviews</strong> - Each camp has a 4.5+ star rating from real families</li>
        <li><strong>Program quality</strong> - Experienced instructors with proven curricula</li>
        <li><strong>Value</strong> - Fair pricing with transparent cancellation policies</li>
        <li><strong>Variety</strong> - Options for different ages, interests, and budgets</li>
      </ul>

      <h2>Top 15 Summer Camps for 2026</h2>

      <h3>1. STEM Explorer Camp (Ages 8-14)</h3>
      <p>Perfect for kids interested in science, technology, engineering, and math. This camp combines hands-on robotics, coding, and science experiments in a fun, collaborative environment.</p>
      <p><strong>Best for:</strong> Kids who love building, coding, and problem-solving</p>
      <p><strong>Location:</strong> Multiple locations nationwide</p>
      <p><strong>Duration:</strong> 1-2 week sessions</p>

      <h3>2. Adventure Wilderness Camp (Ages 10-16)</h3>
      <p>Outdoor enthusiasts will thrive in this wilderness program featuring hiking, rock climbing, kayaking, and survival skills training.</p>
      <p><strong>Best for:</strong> Active kids who love nature and outdoor challenges</p>
      <p><strong>Location:</strong> Mountain regions</p>
      <p><strong>Duration:</strong> 1-4 week sessions</p>

      <h3>3. Creative Arts Academy (Ages 7-15)</h3>
      <p>Budding artists, musicians, and performers can explore painting, sculpture, theater, dance, and music in this comprehensive arts program.</p>
      <p><strong>Best for:</strong> Creative kids interested in visual and performing arts</p>
      <p><strong>Location:</strong> Urban centers</p>
      <p><strong>Duration:</strong> 1-3 week sessions</p>

      <h2>Factors to Consider When Choosing a Summer Camp</h2>

      <h3>1. Your Child's Interests and Personality</h3>
      <p>The best camp is one that aligns with your child's passions. Consider whether your child prefers:</p>
      <ul>
        <li>Structured activities or free exploration</li>
        <li>Team sports or individual pursuits</li>
        <li>Indoor or outdoor environments</li>
        <li>Learning new skills or practicing existing ones</li>
      </ul>

      <h3>2. Day Camp vs. Overnight Camp</h3>
      <p>Day camps are great for younger children or first-time campers, while overnight camps offer more independence and immersive experiences for older kids.</p>

      <h3>3. Safety and Accreditation</h3>
      <p>Always verify that camps have:</p>
      <ul>
        <li>Proper insurance and licensing</li>
        <li>Background-checked staff</li>
        <li>Clear safety protocols</li>
        <li>Medical staff on-site</li>
        <li>Emergency action plans</li>
      </ul>

      <h3>4. Cost and Value</h3>
      <p>Summer camps range from $200 to $2,000+ per week. Consider:</p>
      <ul>
        <li>What's included (meals, equipment, transportation)</li>
        <li>Early bird discounts</li>
        <li>Sibling discounts</li>
        <li>Financial aid options</li>
        <li>Cancellation policies</li>
      </ul>

      <h2>When to Register</h2>
      <p>Many popular camps fill up by February or March for summer sessions. Start researching in November/December and register by January to secure your spot and take advantage of early-bird pricing.</p>

      <h2>Questions to Ask Before Booking</h2>
      <ol>
        <li>What is the camper-to-counselor ratio?</li>
        <li>What are the staff qualifications?</li>
        <li>How do you handle behavioral issues?</li>
        <li>What is your emergency protocol?</li>
        <li>Can I speak with references from other parents?</li>
        <li>What's your cancellation/refund policy?</li>
      </ol>

      <h2>Final Thoughts</h2>
      <p>Summer camp is more than just childcare—it's an opportunity for your child to grow, make friends, discover new passions, and build confidence. Whether you choose a STEM program, outdoor adventure, sports camp, or arts academy, the key is finding a safe, engaging program that sparks your child's curiosity.</p>

      <p>Browse our complete directory of verified summer camps, read parent reviews, and book with confidence on FutureEdge.</p>
    `,
  },
  {
    title: 'How to Prepare Your Child for Their First Summer Camp Experience',
    slug: 'prepare-child-first-summer-camp',
    excerpt: 'First-time camp jitters are normal! Learn how to prepare your child emotionally and practically for their first summer camp adventure.',
    seo_title: 'How to Prepare Your Child for First Summer Camp | Parent Tips',
    seo_description: 'Expert tips to help parents prepare kids for their first summer camp. Overcome homesickness, pack essentials, and build excitement for camp.',
    seo_keywords: 'first summer camp, prepare child for camp, summer camp tips, homesickness prevention',
    category_slug: 'camp-tips',
    content: `
      <h2>Introduction</h2>
      <p>Sending your child to summer camp for the first time is an exciting milestone—but it can also bring anxiety for both parents and kids. Will they make friends? What if they get homesick? Did we pack everything they need?</p>

      <p>This guide will help you prepare your child emotionally and practically for their first camp experience, ensuring they have an amazing time.</p>

      <h2>Emotional Preparation: Building Confidence and Excitement</h2>

      <h3>Start Conversations Early</h3>
      <p>Begin talking about camp 4-6 weeks before the start date. Share what they'll do, who they'll meet, and what makes camp special. Avoid making it seem scary or overwhelming.</p>

      <h3>Focus on the Positives</h3>
      <p>Emphasize exciting aspects:</p>
      <ul>
        <li>"You'll get to try rock climbing!"</li>
        <li>"You might make friends from different schools"</li>
        <li>"Camp has a pool and you can swim every day"</li>
      </ul>

      <h3>Address Fears Openly</h3>
      <p>Ask: "Is there anything you're worried about?" Common fears include:</p>
      <ul>
        <li>Not knowing anyone</li>
        <li>Missing home/family</li>
        <li>Not being good at activities</li>
        <li>Sleeping away from home (for overnight camps)</li>
      </ul>

      <p>Validate their feelings and problem-solve together.</p>

      <h3>Practice Independence Skills</h3>
      <p>Before camp, help your child practice:</p>
      <ul>
        <li>Making their bed</li>
        <li>Organizing their belongings</li>
        <li>Showering on their own</li>
        <li>Introducing themselves to new people</li>
        <li>Asking adults for help when needed</li>
      </ul>

      <h2>Practical Preparation: Packing and Logistics</h2>

      <h3>Essential Packing List</h3>
      <p>Every camp provides a packing list, but here are universal essentials:</p>

      <h4>Clothing:</h4>
      <ul>
        <li>7-10 outfits (t-shirts, shorts, pants)</li>
        <li>7-10 sets of underwear and socks</li>
        <li>Swimsuit(s) and towel</li>
        <li>Light jacket or sweatshirt</li>
        <li>Rain gear</li>
        <li>Comfortable closed-toe shoes</li>
        <li>Flip-flops or sandals</li>
        <li>Hat and sunglasses</li>
      </ul>

      <h4>Toiletries:</h4>
      <ul>
        <li>Toothbrush and toothpaste</li>
        <li>Soap, shampoo, conditioner</li>
        <li>Sunscreen (SPF 30+)</li>
        <li>Bug spray</li>
        <li>Deodorant</li>
        <li>Brush/comb</li>
      </ul>

      <h4>Other Essentials:</h4>
      <ul>
        <li>Water bottle</li>
        <li>Backpack or daypack</li>
        <li>Flashlight</li>
        <li>Sleeping bag and pillow (for overnight camps)</li>
        <li>Medications (with proper forms)</li>
      </ul>

      <h3>Label Everything!</h3>
      <p>Use permanent markers or iron-on labels to mark all clothing and belongings with your child's name. Lost-and-found bins fill up quickly.</p>

      <h3>What NOT to Pack</h3>
      <p>Most camps prohibit:</p>
      <ul>
        <li>Electronics (phones, tablets, gaming devices)</li>
        <li>Valuable jewelry</li>
        <li>Weapons or dangerous items</li>
        <li>Food (especially perishables)</li>
      </ul>

      <h2>Managing Homesickness</h2>

      <h3>Before Camp</h3>
      <ul>
        <li>Don't make promises like "I'll pick you up if you're sad"</li>
        <li>Create a "countdown to camp" calendar to build excitement</li>
        <li>Read books about summer camp together</li>
        <li>Connect with other families attending the same camp</li>
      </ul>

      <h3>During Camp</h3>
      <ul>
        <li>Follow the camp's communication policy (many limit parent contact intentionally)</li>
        <li>If your child calls crying, stay calm and positive</li>
        <li>Remind them that homesickness usually passes in 24-48 hours</li>
        <li>Trust camp staff—they're trained to help</li>
      </ul>

      <h3>Letters and Care Packages</h3>
      <p>Pre-write letters before camp starts (one for each day) and give them to staff to distribute. Include:</p>
      <ul>
        <li>Encouragement and affirmation</li>
        <li>Updates about what's happening at home (pet antics, etc.)</li>
        <li>Questions about their day</li>
        <li>Reminders of how proud you are</li>
      </ul>

      <h2>The Drop-Off: Dos and Don'ts</h2>

      <h3>DO:</h3>
      <ul>
        <li>Arrive on time</li>
        <li>Be enthusiastic and positive</li>
        <li>Introduce yourself to counselors</li>
        <li>Hug goodbye and leave promptly</li>
        <li>Trust the process</li>
      </ul>

      <h3>DON'T:</h3>
      <ul>
        <li>Linger or draw out goodbyes</li>
        <li>Cry in front of your child</li>
        <li>Sneak away without saying goodbye</li>
        <li>Make promises you can't keep</li>
        <li>Show your own anxiety</li>
      </ul>

      <h2>After Camp: Reflecting on the Experience</h2>
      <p>When you pick up your child:</p>
      <ul>
        <li>Let them decompress—they might be tired or overwhelmed</li>
        <li>Ask open-ended questions: "What was your favorite part?"</li>
        <li>Don't immediately ask "Did you make friends?"</li>
        <li>Look through photos together</li>
        <li>Help them stay in touch with new friends</li>
      </ul>

      <h2>Final Thoughts</h2>
      <p>Remember: The first 24-48 hours are the hardest. After that, most kids settle in and have an incredible time. Summer camp builds resilience, independence, and lifelong memories.</p>

      <p>Trust your child, trust the camp staff, and trust the process. You've got this!</p>
    `,
  },
  {
    title: 'Day Camp vs. Overnight Camp: Which is Right for Your Child?',
    slug: 'day-camp-vs-overnight-camp',
    excerpt: 'Trying to decide between day camp and overnight camp? We break down the pros, cons, costs, and considerations to help you choose.',
    seo_title: 'Day Camp vs Overnight Camp: Complete Comparison Guide 2026',
    seo_description: 'Compare day camps and overnight camps to find the perfect fit for your child. Learn about costs, benefits, age recommendations, and more.',
    seo_keywords: 'day camp vs overnight camp, sleepaway camp, summer camp comparison, camp options',
    category_slug: 'parent-guides',
    content: `
      <h2>Introduction</h2>
      <p>One of the biggest decisions parents face when choosing summer camp is whether to send their child to a day camp or an overnight (sleepaway) camp. Both options offer amazing benefits, but the right choice depends on your child's age, personality, and your family's needs.</p>

      <p>This guide will help you weigh the pros and cons of each option so you can make the best decision for your family.</p>

      <h2>What is a Day Camp?</h2>
      <p>Day camps operate during daytime hours (typically 9am-4pm) and children go home each evening. They're similar to a school day but focused on fun activities like sports, arts, swimming, and field trips.</p>

      <h3>Pros of Day Camps:</h3>
      <ul>
        <li><strong>Less expensive:</strong> Typically $200-$600 per week vs $800-$2,000+ for overnight camps</li>
        <li><strong>Easier transition:</strong> Great for younger kids or first-time campers</li>
        <li><strong>Family time:</strong> Kids come home each night to share their day</li>
        <li><strong>Less homesickness:</strong> No overnight separation anxiety</li>
        <li><strong>Flexible commitment:</strong> Often offered in weekly increments</li>
        <li><strong>Easier logistics:</strong> Parents can address any issues daily</li>
      </ul>

      <h3>Cons of Day Camps:</h3>
      <ul>
        <li><strong>Requires daily transportation:</strong> Drop-off and pick-up can be time-consuming</li>
        <li><strong>Less immersive:</strong> Limited bonding time with cabinmates</li>
        <li><strong>Fewer overnight activities:</strong> No campfires, night hikes, or stargazing</li>
        <li><strong>Less independence:</strong> Doesn't teach self-reliance skills as much</li>
      </ul>

      <h3>Best For:</h3>
      <ul>
        <li>Kids ages 5-12 (especially younger children)</li>
        <li>First-time campers</li>
        <li>Children with separation anxiety</li>
        <li>Families on a tighter budget</li>
        <li>Working parents needing structured childcare</li>
      </ul>

      <h2>What is an Overnight Camp?</h2>
      <p>Overnight camps (also called sleepaway camps) involve kids staying at camp for extended periods—anywhere from 1 week to an entire summer. Kids sleep in cabins or bunks with other campers and counselors.</p>

      <h3>Pros of Overnight Camps:</h3>
      <ul>
        <li><strong>Deep friendships:</strong> 24/7 bonding creates lifelong friendships</li>
        <li><strong>Complete immersion:</strong> Kids fully engage without distractions</li>
        <li><strong>Independence building:</strong> Teaches self-sufficiency and decision-making</li>
        <li><strong>Unique experiences:</strong> Campfires, night activities, cabin traditions</li>
        <li><strong>Break from screens:</strong> Most overnight camps are tech-free</li>
        <li><strong>Parent break:</strong> Parents get a chance to recharge too</li>
      </ul>

      <h3>Cons of Overnight Camps:</h3>
      <ul>
        <li><strong>Expensive:</strong> Can cost $800-$2,000+ per week</li>
        <li><strong>Homesickness:</strong> Some kids struggle being away from home</li>
        <li><strong>Limited parental control:</strong> Can't step in immediately if issues arise</li>
        <li><strong>Longer commitment:</strong> Often 1-2 week minimums</li>
        <li><strong>Less supervision:</strong> Staff can't watch every child every moment</li>
      </ul>

      <h3>Best For:</h3>
      <ul>
        <li>Kids ages 8+ (most overnight camps start at age 7-8)</li>
        <li>Independent, social children</li>
        <li>Kids ready for a challenge and new experiences</li>
        <li>Families seeking immersive skill-building</li>
        <li>Kids who've done day camp and are ready for more</li>
      </ul>

      <h2>Side-by-Side Comparison</h2>

      <table>
        <tr>
          <th>Factor</th>
          <th>Day Camp</th>
          <th>Overnight Camp</th>
        </tr>
        <tr>
          <td>Cost per week</td>
          <td>$200-$600</td>
          <td>$800-$2,000+</td>
        </tr>
        <tr>
          <td>Typical age range</td>
          <td>5-14</td>
          <td>7-17</td>
        </tr>
        <tr>
          <td>Duration</td>
          <td>1-10 weeks (daily)</td>
          <td>1-8 weeks (overnight)</td>
        </tr>
        <tr>
          <td>Parent contact</td>
          <td>Daily</td>
          <td>Letters, limited calls</td>
        </tr>
        <tr>
          <td>Independence level</td>
          <td>Moderate</td>
          <td>High</td>
        </tr>
        <tr>
          <td>Best first camp age</td>
          <td>5-6 years old</td>
          <td>8-10 years old</td>
        </tr>
      </table>

      <h2>How to Decide: Questions to Ask Yourself</h2>

      <h3>1. Is my child emotionally ready?</h3>
      <p>Consider:</p>
      <ul>
        <li>Have they had successful sleepovers?</li>
        <li>Can they manage basic self-care (showering, dressing, organizing)?</li>
        <li>Do they handle new situations well?</li>
        <li>Are they comfortable asking adults for help?</li>
      </ul>

      <h3>2. What are our family logistics?</h3>
      <ul>
        <li>Can we handle daily drop-off/pick-up? (Day camp)</li>
        <li>Do both parents work full-time? (Day camp may be more practical)</li>
        <li>Are we available for emergencies? (Overnight camp gives parents a break)</li>
      </ul>

      <h3>3. What's our budget?</h3>
      <ul>
        <li>Day camps: Budget $1,000-$3,000 for a full summer</li>
        <li>Overnight camps: Budget $1,600-$8,000+ for 2-4 weeks</li>
        <li>Consider financial aid options at both types</li>
      </ul>

      <h3>4. What does my child want?</h3>
      <p>Ask them! Some kids eagerly want the overnight experience, while others prefer coming home each night. Their input matters.</p>

      <h2>Middle Ground: Mini Overnight Sessions</h2>
      <p>Many camps offer "mini sessions" (2-3 nights) for first-time overnight campers. This is a great way to test the waters before committing to a full week or longer.</p>

      <h2>Transitioning from Day to Overnight Camp</h2>
      <p>Most families follow this progression:</p>
      <ul>
        <li><strong>Ages 5-7:</strong> Day camp</li>
        <li><strong>Ages 8-9:</strong> Mini overnight session (2-3 nights)</li>
        <li><strong>Ages 10+:</strong> Full week overnight camps</li>
        <li><strong>Ages 12+:</strong> Multi-week overnight camps</li>
      </ul>

      <h2>Final Thoughts</h2>
      <p>There's no "wrong" choice between day and overnight camp—both offer incredible value. The key is matching the camp type to your child's readiness, your family's logistics, and your budget.</p>

      <p>Many families do a combination: day camp when kids are younger, transitioning to overnight camp as they mature. Others stick with day camps throughout and that's perfectly fine too!</p>

      <p>Browse both day and overnight camps on FutureEdge to compare options and find the perfect fit for your child.</p>
    `,
  },
];

async function generateBlogPosts() {
  console.log('🚀 Starting blog post generation...');

  try {
    // Get the default author
    const { data: author, error: authorError } = await supabase
      .from('blog_authors')
      .select('id')
      .eq('name', 'FutureEdge Team')
      .single();

    if (authorError || !author) {
      console.error('Error: Could not find default author. Make sure the migration has been run.');
      return;
    }

    console.log(`✓ Found author: FutureEdge Team (${author.id})`);

    // Generate posts
    for (const post of sampleBlogPosts) {
      console.log(`\n📝 Creating post: "${post.title}"`);

      // Get category ID
      const { data: category, error: categoryError } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', post.category_slug)
        .single();

      if (categoryError || !category) {
        console.error(`❌ Error: Could not find category with slug "${post.category_slug}"`);
        continue;
      }

      // Insert blog post
      const { data: createdPost, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          seo_title: post.seo_title,
          seo_description: post.seo_description,
          seo_keywords: post.seo_keywords,
          author_id: author.id,
          category_id: category.id,
          status: 'published',
          published_at: new Date().toISOString(),
          featured_image: `https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200&h=630&fit=crop`, // Placeholder
        })
        .select()
        .single();

      if (postError) {
        console.error(`❌ Error creating post: ${postError.message}`);
        continue;
      }

      console.log(`✓ Created: /blog/${post.slug}`);
    }

    console.log('\n✅ Blog post generation complete!');
    console.log('\nNext steps:');
    console.log('1. Run the database migration: supabase db push');
    console.log('2. Visit http://localhost:5173/blog to see your posts');
    console.log('3. Replace placeholder images with real featured images');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
generateBlogPosts();
