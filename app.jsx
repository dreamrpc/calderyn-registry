/* ════════════════════════════════════════════════════════════════════════
   CALDERYN COLLEGE — APPLICATION CODE
   ────────────────────────────────────────────────────────────────────────
   This file contains the React-based registration form for Calderyn
   College (Calderyn RP Discord server). All applications are routed
   through a Cloudflare Worker that forwards them to the appropriate
   Discord webhook based on the selected track/type.

   Anti-spam Features:
   - Character limits with live counters (80/500/400/500/500/300)
   - 5-second minimum fill timer  
   - Rate limiting (8 submissions per 10 minutes per browser)
   - Whitespace wall-of-text detection
   - Honeypot fields for bot detection
   - Admin role ping on submission

   Submission Flow:
   User fills form → Cloudflare Worker (calderyn-registry-relay) → Discord webhook
   ═══════════════════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef } = React;

const WORKER_URL = "https://calderyn-registry-relay.dreamroleplaywriter.workers.dev";

const CHAR_LIMITS = { alias: 80, power: 500, powerExpression: 400, drawbacks: 500, concept: 500, notes: 300 };
const RATE_LIMIT_KEY = 'calderyn_submissions';
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MIN_FILL_TIME = 5000; // 5 seconds

// Helper functions for character counting and rate limiting
const updateCharCount = (field, value, setCharCounts) => setCharCounts(prev => ({ ...prev, [field]: value?.length || 0 }));
const getCounterColor = (field, charCounts) => {
     const count = charCounts[field] || 0;
     const limit = CHAR_LIMITS[field];
     if (count >= limit) return '#e53e3e';
     if (count >= limit * 0.9) return '#d69e2e'; 
     return '#666';
};

const checkRateLimit = () => {
     const stored = localStorage.getItem(RATE_LIMIT_KEY);
     const submissions = stored ? JSON.parse(stored) : [];
     const now = Date.now();
     const recent = submissions.filter(time => now - time < RATE_LIMIT_WINDOW);
     return recent.length < RATE_LIMIT_MAX;
};

const addToRateLimit = () => {
     const stored = localStorage.getItem(RATE_LIMIT_KEY);
     const submissions = stored ? JSON.parse(stored) : [];
     const now = Date.now();
     submissions.push(now);
     const recent = submissions.filter(time => now - time < RATE_LIMIT_WINDOW);
     localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
};

const hasExcessiveWhitespace = (text) => {
     if (!text) return false;
     const words = text.trim().split(/\s+/);
     if (words.length === 1 && text.length > 200) return true; // Single blob
     const avgWordLength = text.replace(/\s/g, '').length / words.length;
     return avgWordLength > 50; // Likely copy-paste spam
};

// Encode types for webhook routing
const PRIMARY = "Primary";
const FACULTY = "Faculty"; 
const STRATA = "Strata";
const CLUB = "Club";
const GOV = "Gov";
const COLLECTIVE = "Collective";
const OUTSIDE = "Outside";
const FALLBACK = "Fallback";

const TRACKS = {
     [PRIMARY]: { name: "Student", list: "Resident", list_Student: "Resident", list_Visitor: "Visitor" },
     [FACULTY]: { name: "Faculty" },
     [STRATA]: { name: "Strata" },  
     [CLUB]: { name: "Club" },
     [GOV]: { name: "Gov" },
     [COLLECTIVE]: { name: "Collective" },
     [OUTSIDE]: { name: "Outside" },
     [FALLBACK]: { name: "Fallback" }
};

const TIERS = { 
     "S-List": "#e53e3e", "A-List": "#d69e2e", "B-List": "#38a169", 
     "C-List": "#3182ce", "D-List": "#805ad5", "Unranked": "#666"
};

   const HOUSES = {
        "Valaris": { color: "#e53e3e", desc: "Ambitious" },
        "Drakmoor": { color: "#805ad5", desc: "Knowledge" }, 
        "Thornwick": { color: "#38a169", desc: "Unity" },
        "Astoria": { color: "#d69e2e", desc: "Honor" }
   };

// Layout components
function Hint({ children, className = "" }) {
     return React.createElement('div', { 
                                    className: `hint ${className}`,
            style: { fontSize: '0.85em', color: '#666', marginTop: '4px', lineHeight: '1.3' }
     }, children);
}

function Field({ label, value, onChange, required = false, type = "text", placeholder = "", hint = null, ...props }) {
     const fieldKey = props.name || label.toLowerCase().replace(/\s+/g, '');

  return React.createElement('div', { className: 'field' }, [
         React.createElement('label', { key: 'label' }, [
                  label,
                  required && React.createElement('span', { key: 'req', style: { color: '#e53e3e', marginLeft: '2px' } }, ' *')
                ]),
         React.createElement('input', {
                  key: 'input',
                  ...props,
                  type,
                  value: value || '',
                  placeholder,
                  onChange: (e) => onChange(e.target.value),
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }
         }),
         hint && React.createElement(Hint, { key: 'hint' }, hint)
       ]);
}

function TextArea({ label, value, onChange, required = false, placeholder = "", hint = null, charCounts, setCharCounts, ...props }) {
     const fieldKey = props.name || label.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
     const limit = CHAR_LIMITS[fieldKey];
     const count = charCounts?.[fieldKey] || 0;

  return React.createElement('div', { className: 'field' }, [
         React.createElement('label', { key: 'label' }, [
                  label,
                  required && React.createElement('span', { key: 'req', style: { color: '#e53e3e', marginLeft: '2px' } }, ' *'),
                  limit && React.createElement('span', { 
                                                       key: 'counter', 
                             style: { float: 'right', fontSize: '0.8em', color: getCounterColor(fieldKey, charCounts) }
                  }, `${count}/${limit}`)
                ]),
         React.createElement('textarea', {
                  key: 'textarea',
                  ...props,
                  value: value || '',
                  placeholder,
                  maxLength: limit,
                  onChange: (e) => {
                             onChange(e.target.value);
                             if (setCharCounts) updateCharCount(fieldKey, e.target.value, setCharCounts);
                  },
                  style: { width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }
         }),
         hint && React.createElement(Hint, { key: 'hint' }, hint),
         (fieldKey === 'powerExpression' || fieldKey === 'drawbacks' || fieldKey === 'concept') && 
           React.createElement(Hint, { key: 'gdocs' }, 'Need more room? Write it in Google Docs and drop the link.')
       ]);
}
function ApplicationForm() {
     const [form, setForm] = useState({
            char: '', alias: '', house: '', year: '', track: '', tier: '', power: '', powerExpression: '', drawbacks: '', concept: '', notes: '',
            facultyRole: '', facultySection: '', clubName: '', clubPosition: '', clubTeam: '', rpcLink: '', outsideOrg: '', outsideRole: '', outsideSection: '',
            govSeat: '', govSection: '', collectiveName: '', collectiveRole: '', rulesAgree: false, hp: ''
     });

  const [charCounts, setCharCounts] = useState({ alias: 0, power: 0, powerExpression: 0, drawbacks: 0, concept: 0, notes: 0 });
     const [formStartTime, setFormStartTime] = useState(null);
     const [submitting, setSubmitting] = useState(false);
     const [submitted, setSubmitted] = useState(false);
     const [error, setError] = useState('');

  useEffect(() => {
         if (!formStartTime) setFormStartTime(Date.now());
  }, []);

  // Form handlers
  const updateField = (field, value) => {
         setForm(prev => ({ ...prev, [field]: value }));
         if (['alias', 'power', 'powerExpression', 'drawbacks', 'concept', 'notes'].includes(field)) {
                  updateCharCount(field, value, setCharCounts);
         }
  };

  const getType = () => {
         switch(form.track) {
            case 'Student': return PRIMARY;
            case 'Faculty': return FACULTY;
            case 'Strata': return STRATA;
            case 'Club': return CLUB;
            case 'Gov': return GOV;
            case 'Collective': return COLLECTIVE;
            case 'Outside': return OUTSIDE;
            default: return FALLBACK;
         }
  };

  // Build the data-file-shaped snippet for admin to paste into character data
  const buildSnippet = () => {
         const s = (v) => v ? `"${v.replace(/"/g, '\\"')}"` : '""';
         switch (form.track) {
            case "Student":
                       return `{ char: ${s(form.char)}, alias: ${s(form.alias) || '""'}, house: ${s(form.house)}, year: ${s(form.year)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            case "Faculty":
                       return `// → goes in Faculty → "${form.facultySection || ''}" section\\n{ char: ${s(form.char)}, alias: ${s(form.alias) || '""'}, facultyRole: ${s(form.facultyRole)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            case "Strata":
                       return `// → goes in the strata → ${form.house} list, exact same as student\\n{ char: ${s(form.char)}, alias: ${s(form.alias) || '""'}, house: ${s(form.house)}, year: ${s(form.year)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            case "Club":
                       return `// → goes in Club → "${form.clubName || ''}" → ${form.clubPosition || ''} list\\n{ char: ${s(form.char)}, alias: ${s(form.alias)}, clubName: ${s(form.clubName)}, clubPosition: ${s(form.clubPosition)}, clubTeam: ${s(form.clubTeam)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            case "Gov":
                       return `// → goes in Gov → "${form.govSection || ''}" → [gov position]\\n{ char: ${s(form.char)}, alias: ${s(form.alias)}, govSeat: ${s(form.govSeat)}, govSection: ${s(form.govSection)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            case "Collective":
                       return `// → goes in Outside → "${form.collectiveName || ''}" → collective\\n{ char: ${s(form.char)}, alias: ${s(form.alias) || '""'}, collectiveName: ${s(form.collectiveName)}, collectiveRole: ${s(form.collectiveRole)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            case "Outside":
                       return `// → goes in Outside → "${form.outsideOrg || ''}" → org "${s(form.outsideRole)}"\\n{ char: ${s(form.char)}, alias: ${s(form.alias)}, outsideOrg: ${s(form.outsideOrg)}, outsideRole: ${s(form.outsideRole)}, track: ${s(form.track)}, tier: ${s(form.tier)}, power: ${s(form.power)}, powerExpression: ${s(form.powerExpression)}, drawbacks: ${s(form.drawbacks)}, concept: ${s(form.concept)}, notes: ${s(form.notes)} },`;
            default: return "";
         }
  };

  // Submit handler with all validations
  const submit = async () => {
         if (form.hp) return; // Honeypot check

         // Rate limiting check
         if (!checkRateLimit()) {
                  setError(\`Rate limit exceeded. You can only submit \${RATE_LIMIT_MAX} applications per 10 minutes.\`);
                        return;
                            }

                                    // Timer check
                                        const timeFilled = Date.now() - (formStartTime || Date.now());
                                            if (timeFilled < MIN_FILL_TIME) {
                                                  setError(\`Please take at least \${MIN_FILL_TIME/1000} seconds to fill out the form.\`);
                                                        return;
                                                            }

                                                                    // Whitespace checks
                                                                        const textFields = [form.powerExpression, form.drawbacks, form.concept, form.notes];
                                                                            for (const field of textFields) {
                                                                                  if (field && hasExcessiveWhitespace(field)) {
                                                                                          setError('Please break up large blocks of text into paragraphs. Use proper spacing and structure.');
                                                                                                  return;
                                                                                                        }
                                                                                                            }
                                                                                                                
                                                                                                                    setSubmitting(true);
                                                                                                                        setError('');
                                                                                                                            
                                                                                                                                try {
                                                                                                                                      // Build payload
                                                                                                                                            const type = getType();
                                                                                                                                                  const payload = {
                                                                                                                                                          type,
                                                                                                                                                                  content: "<@&1498799678551101451>", // Admin role ping
                                                                                                                                                                          payload: {
                                                                                                                                                                                    embeds: [{
                                                                                                                                                                                                title: \`New \${form.track || 'Unknown'} Application\`,
                                                                                                                                                                                                            color: TIERS[form.tier] || 0x666666,
                                                                                                                                                                                                                        fields: [],
                                                                                                                                                                                                                                    footer: { text: \`Track: \${form.track}\` },
                                                                                                                                                                                                                                                timestamp: new Date().toISOString()
                                                                                                                                                                                                                                                          }]
                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                        };
                                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                    const fields = payload.payload.embeds[0].fields;
                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                // Build embed fields
                                                                                                                                                                                                                                                                                                      if (form.char) fields.push({ name: "Character Name", value: form.char, inline: true });
                                                                                                                                                                                                                                                                                                            if (form.alias) fields.push({ name: "Alias/Codename", value: form.alias.slice(0, 1024), inline: true });
                                                                                                                                                                                                                                                                                                                  if (form.house) fields.push({ name: "House", value: form.house, inline: true });
                                                                                                                                                                                                                                                                                                                        if (form.year) fields.push({ name: "Year", value: form.year, inline: true });
                                                                                                                                                                                                                                                                                                                              if (form.tier) fields.push({ name: "Tier", value: form.tier, inline: true });
                                                                                                                                                                                                                                                                                                                                    if (form.power) fields.push({ name: "Power Type", value: form.power, inline: false });
                                                                                                                                                                                                                                                                                                                                          if (form.powerExpression) fields.push({ name: "Power Expression / How It Works", value: form.powerExpression.slice(0, 1024), inline: false });
                                                                                                                                                                                                                                                                                                                                                if (form.drawbacks) fields.push({ name: "Drawbacks / Limits", value: form.drawbacks.slice(0, 1024), inline: false });
                                                                                                                                                                                                                                                                                                                                                      if (form.concept) fields.push({ name: "Character Concept", value: form.concept.slice(0, 1024), inline: false });
                                                                                                                                                                                                                                                                                                                                                            if (form.notes) fields.push({ name: "Additional Notes", value: form.notes.slice(0, 1024), inline: false });
                                                                                                                                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                                                                                        // Track-specific fields
                                                                                                                                                                                                                                                                                                                                                                              if (form.facultyRole) fields.push({ name: "Faculty Role", value: \`\${form.facultyRole} (\${form.facultySection || 'Unspecified'})\`, inline: true });
                                                                                                                                                                                                                                                                                                                                                                                    if (form.clubName) fields.push({ name: "Club", value: \`\${form.clubName} - \${form.clubPosition || 'Member'}\${form.clubTeam ? \` (\${form.clubTeam})\` : ''}\`, inline: true });
                                                                                                                                                                                                                                                                                                                                                                                          if (form.govSeat) fields.push({ name: "Government Position", value: \`\${form.govSeat} (\${form.govSection || 'Unspecified'})\`, inline: true });
                                                                                                                                                                                                                                                                                                                                                                                                if (form.collectiveName) fields.push({ name: "Collective", value: \`\${form.collectiveName} - \${form.collectiveRole || 'Member'}\`, inline: true });
                                                                                                                                                                                                                                                                                                                                                                                                      if (form.outsideOrg) fields.push({ name: "Outside Organization", value: \`\${form.outsideOrg} - \${form.outsideRole || 'Member'}\`, inline: true });
                                                                                                                                                                                                                                                                                                                                                                                                            if (form.rpcLink) fields.push({ name: "RPC Link", value: form.rpcLink.slice(0, 200), inline: false });
                                                                                                                                                                                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                                                                                                                                        // Data snippet
                                                                                                                                                                                                                                                                                                                                                                                                                              const snippet = buildSnippet();
                                                                                                                                                                                                                                                                                                                                                                                                                                    if (snippet) fields.push({ name: "Data File Entry", value: \`\\\`\\\`\\\`js\\n\${snippet}\\n\\\`\\\`\\\`\`, inline: false });
                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                                                                                                                                // Submit to Worker
                                                                                                                                                                                                                                                                                                                                                                                                                                                      const response = await fetch(WORKER_URL, {
                                                                                                                                                                                                                                                                                                                                                                                                                                                              method: 'POST',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      headers: { 'Content-Type': 'application/json' },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              body: JSON.stringify(payload)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            addToRateLimit();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  setSubmitted(true);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  setError(\`Submission failed: \${err.message}\`);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      } finally {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            setSubmitting(false);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  };  if (submitted) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      return React.createElement('div', { className: 'success-message' }, [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            React.createElement('h2', { key: 'title' }, 'APPLICATION SENT'),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  React.createElement('p', { key: 'msg' }, 'Your application has been submitted and will be reviewed by admins.'),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        React.createElement('button', { 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                key: 'reset', 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        onClick: () => { setSubmitted(false); setForm({}); setCharCounts({}) },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                style: { marginTop: '20px', padding: '10px 20px' }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }, 'Submit Another')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              const isComplete = form.char && form.track && form.tier && form.rulesAgree && !form.hp;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  return React.createElement('form', { 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      onSubmit: (e) => { e.preventDefault(); submit(); },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          style: { maxWidth: '600px', margin: '0 auto', padding: '20px' }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }, [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                React.createElement('h1', { key: 'title' }, 'CALDERYN COLLEGE — Application'),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        // Error display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            error && React.createElement('div', { 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  key: 'error', 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        style: { background: '#ffe6e6', border: '1px solid #e53e3e', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: '#e53e3e' }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }, error),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    // Basic info
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        React.createElement('section', { key: 'basic' }, [
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              React.createElement('h3', { key: 'title' }, 'Basic Information'),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    React.createElement(Field, {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            key: 'char',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    label: 'Character Name',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            value: form.char,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    onChange: (v) => updateField('char', v),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            placeholder: 'Full character name',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    required: true
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          }),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                React.createElement(Field, {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        key: 'alias', 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                name: 'alias',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        label: 'Alias/Codename',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                value: form.alias,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        onChange: (v) => updateField('alias', v),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                placeholder: 'Hero/villain name, nickname, etc',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        maxLength: CHAR_LIMITS.alias,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                hint: charCounts.alias ? `${charCounts.alias}/${CHAR_LIMITS.alias} characters` : null
         })
         ]),

       // Track selection
         React.createElement('section', { key: 'track' }, [
           React.createElement('h3', { key: 'title' }, 'Track'),
           React.createElement('div', { key: 'options', className: 'track-options' }, 
                                       Object.keys(TRACKS).map(trackKey => 
                                                                         React.createElement('label', { 
                                                                                                         key: trackKey, 
                                                                                        className: 'track-option',
                                                                                        style: { 
                                                                                          display: 'block', 
                                                                                                         padding: '10px', 
                                                                                                         margin: '5px 0', 
                                                                                                         border: '1px solid #ccc', 
                                                                                                         borderRadius: '4px',
                                                                                                         cursor: 'pointer',
                                                                                                         background: form.track === trackKey ? '#f0f8ff' : 'white'
                                                                                           }
                                                                         }, [
                                                                                        React.createElement('input', {
                                                                                                         key: 'radio',
                                                                                                         type: 'radio',
                                                                                                         name: 'track',
                                                                                                         value: trackKey,
                                                                                                         checked: form.track === trackKey,
                                                                                                         onChange: (e) => updateField('track', e.target.value),
                                                                                                         style: { marginRight: '8px' }
                                                                                           }),
                                                                                        React.createElement('strong', { key: 'name' }, TRACKS[trackKey].name),
                                                                                        React.createElement('span', { key: 'desc' }, ` - ${trackKey}`)
                                                                                      ])
                                                                       )
                                     )
         ]),

         // Student-specific fields
         form.track === 'Student' && React.createElement('section', { key: 'student' }, [
                  React.createElement('h3', { key: 'title' }, 'Student Details'),
                  React.createElement('div', { key: 'row', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } }, [
                             React.createElement('div', { key: 'house' }, [
                                          React.createElement('label', { key: 'label' }, 'House *'),
                                          React.createElement('select', {
                                                         key: 'select',
                                                         value: form.house || '',
                                                         onChange: (e) => updateField('house', e.target.value),
                                                         style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
                                                         required: true
                                          }, [
                                                         React.createElement('option', { key: 'empty', value: '' }, 'Select House'),
                                                         ...Object.keys(HOUSES).map(house =>
                                                                          React.createElement('option', { key: house, value: house }, house)
                                                                                                )
                                                       ])
                                        ]),
                             React.createElement('div', { key: 'year' }, [
                                          React.createElement('label', { key: 'label' }, 'Year *'),
                                          React.createElement('select', {
                                                         key: 'select',
                                                         value: form.year || '',
                                                         onChange: (e) => updateField('year', e.target.value),
                                                         style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
                                                         required: true
                                          }, [
                                                         React.createElement('option', { key: 'empty', value: '' }, 'Select Year'),
                                                         React.createElement('option', { key: 'freshman', value: 'Freshman' }, 'Freshman'),
                                                         React.createElement('option', { key: 'sophomore', value: 'Sophomore' }, 'Sophomore'), 
                                                         React.createElement('option', { key: 'junior', value: 'Junior' }, 'Junior'),
                                                         React.createElement('option', { key: 'senior', value: 'Senior' }, 'Senior')
                                                       ])
                                        ])
                           ])
                ]),

         // Power info
         React.createElement('section', { key: 'power' }, [
                  React.createElement('h3', { key: 'title' }, 'Power Information'),
                  React.createElement('div', { key: 'tier-power', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } }, [
                             React.createElement('div', { key: 'tier' }, [
                                          React.createElement('label', { key: 'label' }, 'Power Tier *'),
                                          React.createElement('select', {
                                                         key: 'select',
                                                         value: form.tier || '',
                                                         onChange: (e) => updateField('tier', e.target.value),
                                                         style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
                                                         required: true
                                          }, [
                                                         React.createElement('option', { key: 'empty', value: '' }, 'Select Tier'),
                                                         ...Object.keys(TIERS).map(tier =>
                                                                          React.createElement('option', { key: tier, value: tier }, tier)
                                                                                               )
                                                       ])
                                        ]),
                             React.createElement(Field, {
                                          key: 'power',
                                          name: 'power',
                                          label: 'Power Type',
                                          value: form.power,
                                          onChange: (v) => updateField('power', v),
                                          placeholder: 'E.g., Telekinesis, Super Strength, etc',
                                          maxLength: CHAR_LIMITS.power,
                                          hint: charCounts.power ? `${charCounts.power}/${CHAR_LIMITS.power} characters` : null
                             })
                           ]),
                  React.createElement(TextArea, {
                             key: 'expression',
                             name: 'powerExpression', 
                             label: 'Power Expression',
                             value: form.powerExpression,
                             onChange: (v) => updateField('powerExpression', v),
                             placeholder: 'Describe the unique way your power functions...',
                             hint: 'Explain how your specific power works differently from others with similar abilities',
                             charCounts,
                             setCharCounts
                  }),
                  React.createElement(TextArea, {
                             key: 'drawbacks',
                             name: 'drawbacks',
                             label: 'Drawbacks & Limits', 
                             value: form.drawbacks,
                             onChange: (v) => updateField('drawbacks', v),
                             placeholder: 'What are the limitations and costs of your power?',
                             charCounts,
                             setCharCounts
                  })
                ]),

         // Character details
         React.createElement('section', { key: 'character' }, [
                  React.createElement('h3', { key: 'title' }, 'Character Details'),
                  React.createElement(TextArea, {
                             key: 'concept',
                             name: 'concept',
                             label: 'Character Concept',
                             value: form.concept, 
                             onChange: (v) => updateField('concept', v),
                             placeholder: 'Brief character summary, personality, goals...',
                             charCounts,
                             setCharCounts
                  }),
                  React.createElement(TextArea, {
                             key: 'notes',
                             name: 'notes',
                             label: 'Additional Notes',
                             value: form.notes,
                             onChange: (v) => updateField('notes', v),
                             placeholder: 'Anything else you want to mention...',
                             charCounts,
                             setCharCounts
                  })
                ]),

         // Honeypot field (hidden)
         React.createElement('input', {
                  key: 'hp',
                  type: 'text',
                  name: 'website',
                  value: form.hp,
                  onChange: (e) => updateField('hp', e.target.value),
                  style: { display: 'none' },
                  tabIndex: -1,
                  autoComplete: 'off'
         }),

         // Rules agreement
         React.createElement('div', { 
                                   key: 'rules',
                  style: { margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }
         }, [
                  React.createElement('label', { key: 'label', style: { display: 'flex', alignItems: 'flex-start' } }, [
                             React.createElement('input', {
                                          key: 'checkbox',
                                          type: 'checkbox',
                                          checked: form.rulesAgree,
                                          onChange: (e) => updateField('rulesAgree', e.target.checked),
                                          style: { marginRight: '8px', marginTop: '2px' },
                                          required: true
                             }),
                             React.createElement('span', { key: 'text' }, 
                                                           'I acknowledge that I have read and agree to follow the server rules and RP guidelines. *'
                                                         )
                           ])
                ]),

         // Submit button
         React.createElement('button', {
                  key: 'submit',
                  type: 'submit',
                  disabled: !isComplete || submitting,
                  style: { 
                    width: '100%', 
                             padding: '12px', 
                             fontSize: '16px', 
                             fontWeight: 'bold',
                             backgroundColor: isComplete && !submitting ? '#38a169' : '#ccc',
                             color: 'white',
                             border: 'none',
                             borderRadius: '4px',
                             cursor: isComplete && !submitting ? 'pointer' : 'not-allowed',
                             marginTop: '20px'
                  }
         }, submitting ? 'SUBMITTING...' : isComplete ? 'SUBMIT APPLICATION' : 'MISSING: REQUIRED FIELDS')
     ]);
}

// Main app render
function App() {
     return React.createElement('div', { className: 'app' }, [
            React.createElement(ApplicationForm, { key: 'form' })
          ]);
}

// Mount the app
ReactDOM.render(React.createElement(App), document.getElementById('root'));
