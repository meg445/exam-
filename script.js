const SUBJECTS = ['English','Kiswahili','Mathematics','Integrated Science','Social Studies','Pre-Technical Studies','Agriculture & Nutrition','Creative Arts & Sports','Religious Education'];
const SHORT    = ['Eng','Kisw','Math','I.Sci','S.Std','Pre-Tech','Agri','CAS','RE'];
const STORAGE_KEY = 'jr_school_results_v2';

const DEFAULT_DATA = [
  {adm:'JSS/0455',name:'Cynthia Wanjiru',  gender:'Female', grade:'8', marks:[90,85,95,92,88,84,89,91,86]},
  {adm:'JSS/0418',name:'Lydia Akinyi',     gender:'Female', grade:'8', marks:[86,90,78,84,80,82,87,89,85]},
  {adm:'JSS/0421',name:'Achieng Atieno',   gender:'Female', grade:'8', marks:[82,78,91,88,74,80,85,90,77]},
  {adm:'JSS/0431',name:'Grace Chebet',     gender:'Female', grade:'8', marks:[88,76,84,79,82,77,81,85,80]},
  {adm:'JSS/0447',name:'Irene Wambui',     gender:'Female', grade:'8', marks:[79,83,70,81,77,75,84,88,82]},
  {adm:'JSS/0410',name:'Esther Naliaka',   gender:'Female', grade:'8', marks:[73,80,67,75,71,69,78,82,74]},
  {adm:'JSS/0388',name:'Brian Kipchoge',   gender:'Male',   grade:'8', marks:[65,70,58,72,68,61,74,66,71]},
  {adm:'JSS/0396',name:'Hassan Abdullahi', gender:'Male',   grade:'8', marks:[60,58,72,64,57,66,62,59,61]},
  {adm:'JSS/0375',name:'John Kamau',       gender:'Male',   grade:'8', marks:[54,49,61,47,52,55,58,50,46]},
  {adm:'JSS/0402',name:'David Mwangi',     gender:'Male',   grade:'8', marks:[45,52,38,49,55,42,50,48,53]},
  {adm:'JSS/0383',name:'Michael Barasa',   gender:'Male',   grade:'8', marks:[33,41,28,36,44,39,47,45,42]},
  {adm:'JSS/0369',name:'Felix Otieno',     gender:'Male',   grade:'8', marks:[21,34,18,29,31,24,38,40,33]},
];

function mean(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function level(m)  { return m>=76?'EE':m>=51?'ME':m>=26?'AE':'BE'; }
function badge(m)  { return '<span class="badge '+level(m)+'">'+level(m)+'</span>'; }

let results = [];
let perfChart = null; 
let currentGradeFilter = '8'; 

function getFilteredResults() {
  if (currentGradeFilter === 'All') return results;
  return results.filter(r => r.grade === currentGradeFilter);
}

function changeGradeFilter(grade) {
  currentGradeFilter = grade;
  render();
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    results = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
  } catch(e) {
    results = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  render();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    document.getElementById('save-status').innerHTML = '<span class="save-dot"></span> Saved';
  } catch(e) {
    document.getElementById('save-status').textContent = 'Save failed';
  }
}

function render() {
  renderStats();
  renderChart();
  renderTable();
}

function renderStats() {
  const filtered = getFilteredResults();
  const sorted    = [...filtered].sort((a,b)=>mean(b.marks)-mean(a.marks));
  const classMean = filtered.length ? mean(filtered.map(r=>mean(r.marks))).toFixed(2) : '0.00';
  const topName   = sorted[0] ? sorted[0].name : '-';
  const countEE   = filtered.filter(r=>level(mean(r.marks))==='EE').length;
  
  document.getElementById('stats-grid').innerHTML =
    '<div class="stat-card"><div class="label">Total students</div><div class="value">'+filtered.length+'</div></div>'+
    '<div class="stat-card"><div class="label">Class mean score</div><div class="value">'+classMean+'</div></div>'+
    '<div class="stat-card"><div class="label">Top performer</div><div class="value" style="font-size:15px;margin-top:2px">'+topName+'</div></div>'+
    '<div class="stat-card"><div class="label">Exceeding expectation</div><div class="value">'+countEE+'</div><div class="sub">learners</div></div>';
}

function renderChart() {
  const filtered = getFilteredResults();
  const ctx = document.getElementById('subjectChart').getContext('2d');
  
  const avgs = SUBJECTS.map(function(_,i){ 
    const v = filtered.map(function(r){ return r.marks[i]; }); 
    return v.length ? mean(v).toFixed(1) : 0; 
  });

  if (perfChart) perfChart.destroy();

  perfChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SHORT,
      datasets: [{
        label: `Average Score (${currentGradeFilter === 'All' ? 'All Grades' : 'Grade ' + currentGradeFilter})`,
        data: avgs,
        backgroundColor: '#111',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } },
      plugins: { legend: { display: false } }
    }
  });
}

function renderTable() {
  const filtered = getFilteredResults();
  const sorted    = [...filtered].sort((a,b)=>mean(b.marks)-mean(a.marks));
  const avgs      = SUBJECTS.map(function(_,i){ var v=filtered.map(function(r){return r.marks[i];}); return v.length?mean(v):0; });
  const counts    = SUBJECTS.map(function(_,i){ var c={EE:0,ME:0,AE:0,BE:0}; filtered.forEach(function(r){c[level(r.marks[i])]++;}); return c; });
  const classMean = filtered.length ? mean(filtered.map(function(r){return mean(r.marks);})).toFixed(2) : '0.00';

  var thead = '<thead><tr><th>Rank</th><th>Adm No.</th><th>Name</th><th>Gen</th><th>Grade</th>';
  SUBJECTS.forEach(function(s){ thead += '<th>'+s+'</th>'; });
  thead += '<th>Total</th><th>Mean</th><th>Level</th></tr></thead>';

  var tbody = '<tbody>';
  sorted.forEach(function(s,i){
    var total = s.marks.reduce(function(a,b){return a+b;},0);
    var m = mean(s.marks);
    tbody += '<tr>';
    tbody += '<td style="font-size:11px;color:#888;font-weight:500">'+(i+1)+'</td>';
    tbody += '<td style="font-size:11px;color:#888">'+s.adm+'</td>';
    tbody += '<td style="font-weight:500">'+s.name+'</td>';
    tbody += '<td style="font-size:11px;color:#888">'+s.gender[0]+'</td>';
    tbody += '<td style="font-size:11px;color:#888">G'+s.grade+'</td>';
    s.marks.forEach(function(mk){ tbody += '<td>'+mk+' '+badge(mk)+'</td>'; });
    tbody += '<td>'+total+'</td>';
    tbody += '<td style="font-weight:500">'+m.toFixed(2)+'</td>';
    tbody += '<td>'+badge(m)+'</td>';
    tbody += '</tr>';
  });

  if(filtered.length > 0) {
    tbody += '<tr class="summary-row"><td colspan="5">Subject mean</td>';
    avgs.forEach(function(a){ tbody += '<td>'+a.toFixed(1)+'</td>'; });
    tbody += '<td colspan="3">'+classMean+'</td></tr>';

    ['EE','ME','AE','BE'].forEach(function(lv){
      tbody += '<tr class="summary-row"><td colspan="5">No. of '+lv+'</td>';
      counts.forEach(function(c){ tbody += '<td>'+c[lv]+'</td>'; });
      tbody += '<td colspan="3"></td></tr>';
    });
  } else {
    tbody += '<tr><td colspan="20" style="text-align:center; padding: 2rem 0;">No learners found for this grade.</td></tr>';
  }
  
  tbody += '</tbody>';
  document.getElementById('table-wrap').innerHTML = '<table>'+thead+tbody+'</table>';
}

function exportExcel() {
  const filtered = getFilteredResults();
  const sorted = [...filtered].sort((a,b)=>mean(b.marks)-mean(a.marks));
  
  const excelData = sorted.map((student, index) => {
    const total = student.marks.reduce((a, b) => a + b, 0);
    const m = mean(student.marks);
    
    let row = {
      'Rank': index + 1,
      'Admission No': student.adm,
      'Full Name': student.name,
      'Gender': student.gender,
      'Grade': student.grade
    };

    SUBJECTS.forEach((subject, i) => {
      row[`${subject} Score`] = student.marks[i];
      row[`${subject} Level`] = level(student.marks[i]);
    });

    row['Total Score'] = total;
    row['Mean Score'] = m.toFixed(2);
    row['Overall Level'] = level(m);

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  const sheetName = currentGradeFilter === 'All' ? 'All Grades' : `Grade ${currentGradeFilter}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const fileName = currentGradeFilter === 'All' ? 'Junior_School_Results_All.xlsx' : `Junior_School_Results_Grade_${currentGradeFilter}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

function toggleAddForm() {
  var f = document.getElementById('add-form');
  var showing = f.style.display !== 'none';
  f.style.display = showing ? 'none' : 'block';
  if (!showing) {
    var html = '';
    SUBJECTS.forEach(function(_,i){
      html += '<div class="mark-cell"><span class="subj-label">'+SHORT[i]+'</span><input type="number" id="f-mark-'+i+'" min="0" max="100" placeholder="0" /></div>';
    });
    document.getElementById('marks-inputs').innerHTML = html;
  }
}

function addLearner() {
  var adm    = document.getElementById('f-adm').value.trim();
  var name   = document.getElementById('f-name').value.trim();
  var gender = document.getElementById('f-gender').value;
  var grade  = document.getElementById('f-grade').value;
  
  if (!adm || !name) { alert('Please enter admission number and name.'); return; }
  
  var marks = SUBJECTS.map(function(_,i){ return Math.min(100,Math.max(0,parseInt(document.getElementById('f-mark-'+i).value)||0)); });
  
  results.push({adm:adm, name:name, gender:gender, grade:grade, marks:marks});
  saveData();
  
  document.getElementById('view-grade-filter').value = grade;
  currentGradeFilter = grade;
  
  toggleAddForm();
  render();
}

function resetData() {
  if (!confirm('Reset to default data? This cannot be undone.')) return;
  results = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData();
  render();
}

// Initialize the app
loadData();
  
