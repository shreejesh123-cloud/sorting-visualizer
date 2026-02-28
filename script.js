// Sorting Visualizer - script.js
const container = document.getElementById('container');
const algorithmSelect = document.getElementById('algorithm');
const sizeInput = document.getElementById('size');
const speedInput = document.getElementById('speed');
const generateBtn = document.getElementById('generate');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');

let arr = [];
let bars = [];
let running = false;
let paused = false;
let stopRequested = false;

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min }

function generateArray(n=60){
  arr = Array.from({length:n}, ()=>randInt(4, 100));
  render();
}

function clearContainer(){ container.innerHTML = ''; bars = []; }

function render(){
  clearContainer();
  const n = arr.length;
  for(let i=0;i<n;i++){
    const b = document.createElement('div');
    b.className = 'bar';
    b.style.height = (arr[i]) + '%';
    b.dataset.index = i;
    container.appendChild(b);
    bars.push(b);
  }
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function stepDelay(){
  const val = Number(speedInput.value) || 150;
  const delay = Math.max(1, val);
  // lower slider = faster visually, so invert
  const ms = Math.round(1000 * (delay / 1000));
  // pause handling
  while(paused){ await sleep(50); }
  if(stopRequested) throw 'stopped';
  return sleep(ms);
}

function swap(i,j){
  const tmp = arr[i]; arr[i]=arr[j]; arr[j]=tmp;
  bars[i].style.height = arr[i] + '%';
  bars[j].style.height = arr[j] + '%';
}

function color(indices, cls){
  indices.forEach(i=>{ if(bars[i]) bars[i].classList.add(cls); });
}
function uncolorAll(){ bars.forEach(b=>{ b.classList.remove('compare','swap','sorted'); }) }

async function bubbleSort(){
  const n = arr.length;
  for(let i=0;i<n;i++){
    for(let j=0;j<n-1-i;j++){
      uncolorAll(); color([j,j+1],'compare');
      await stepDelay();
      if(arr[j] > arr[j+1]){
        color([j,j+1],'swap');
        await stepDelay();
        swap(j,j+1);
      }
    }
    bars[n-1-i]?.classList.add('sorted');
  }
}

async function selectionSort(){
  const n = arr.length;
  for(let i=0;i<n;i++){
    let min = i;
    for(let j=i+1;j<n;j++){
      uncolorAll(); color([min,j],'compare');
      await stepDelay();
      if(arr[j] < arr[min]) min = j;
    }
    if(min !== i){ color([i,min],'swap'); await stepDelay(); swap(i,min); }
    bars[i].classList.add('sorted');
  }
}

async function insertionSort(){
  for(let i=1;i<arr.length;i++){
    let key = arr[i];
    let j = i-1;
    while(j>=0 && arr[j] > key){
      uncolorAll(); color([j,j+1],'compare');
      await stepDelay();
      arr[j+1] = arr[j];
      bars[j+1].style.height = arr[j+1] + '%';
      j--;
    }
    arr[j+1] = key;
    bars[j+1].style.height = arr[j+1] + '%';
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function mergeSortWrapper(){
  await mergeSort(0, arr.length-1);
  bars.forEach(b=>b.classList.add('sorted'));
}

async function mergeSort(l,r){
  if(l>=r) return;
  const m = Math.floor((l+r)/2);
  await mergeSort(l,m);
  await mergeSort(m+1,r);
  await merge(l,m,r);
}

async function merge(l,m,r){
  const left = arr.slice(l,m+1);
  const right = arr.slice(m+1,r+1);
  let i=0,j=0,k=l;
  while(i<left.length && j<right.length){
    uncolorAll(); color([k],'compare');
    await stepDelay();
    if(left[i] <= right[j]){ arr[k++] = left[i++]; }
    else{ arr[k++] = right[j++]; }
  }
  while(i<left.length){ arr[k++]=left[i++]; }
  while(j<right.length){ arr[k++]=right[j++]; }
  for(let t=l;t<=r;t++) bars[t].style.height = arr[t] + '%';
}

async function quickSortWrapper(){
  await quickSort(0, arr.length-1);
  bars.forEach(b=>b.classList.add('sorted'));
}

async function quickSort(l,r){
  if(l>=r) return;
  const p = await partition(l,r);
  await quickSort(l,p-1);
  await quickSort(p+1,r);
}

async function partition(l,r){
  const pivot = arr[r];
  let i = l;
  for(let j=l;j<r;j++){
    uncolorAll(); color([j,r],'compare');
    await stepDelay();
    if(arr[j] < pivot){ swap(i,j); i++; }
  }
  swap(i,r);
  return i;
}

// ---- additional algorithms ----

async function heapSort(){
  const n = arr.length;
  // build max heap
  for(let i=Math.floor(n/2)-1;i>=0;i--) await heapify(n,i);
  for(let end=n-1;end>0;end--){
    swap(0,end);
    bars[end].classList.add('sorted');
    await heapify(end,0);
  }
  bars[0]?.classList.add('sorted');
}

async function heapify(size,i){
  let largest = i;
  const left = 2*i + 1;
  const right = 2*i + 2;
  if(left < size){
    uncolorAll(); color([i,left],'compare'); await stepDelay();
    if(arr[left] > arr[largest]) largest = left;
  }
  if(right < size){
    uncolorAll(); color([largest,right],'compare'); await stepDelay();
    if(arr[right] > arr[largest]) largest = right;
  }
  if(largest !== i){
    swap(i,largest);
    await heapify(size,largest);
  }
}

async function shellSort(){
  const n = arr.length;
  for(let gap=Math.floor(n/2); gap>0; gap=Math.floor(gap/2)){
    for(let i=gap;i<n;i++){
      let temp = arr[i];
      let j = i;
      while(j>=gap && arr[j-gap] > temp){
        uncolorAll(); color([j,j-gap],'compare'); await stepDelay();
        arr[j] = arr[j-gap];
        bars[j].style.height = arr[j] + '%';
        j -= gap;
      }
      arr[j] = temp;
      bars[j].style.height = arr[j] + '%';
    }
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function cocktailSort(){
  let swapped = true;
  let start = 0;
  let end = arr.length -1;
  while(swapped){
    swapped = false;
    for(let i=start;i<end;i++){
      uncolorAll(); color([i,i+1],'compare'); await stepDelay();
      if(arr[i] > arr[i+1]){ swap(i,i+1); swapped = true; }
    }
    bars[end].classList.add('sorted');
    if(!swapped) break;
    swapped = false;
    end--;
    for(let i=end-1;i>=start;i--){
      uncolorAll(); color([i,i+1],'compare'); await stepDelay();
      if(arr[i] > arr[i+1]){ swap(i,i+1); swapped = true; }
    }
    bars[start].classList.add('sorted');
    start++;
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function combSort(){
  let gap = arr.length;
  const shrink = 1.3;
  let sorted = false;
  while(!sorted){
    gap = Math.floor(gap/shrink);
    if(gap <= 1){ gap = 1; sorted = true; }
    let i = 0;
    while(i + gap < arr.length){
      uncolorAll(); color([i,i+gap],'compare'); await stepDelay();
      if(arr[i] > arr[i+gap]){
        swap(i,i+gap);
        sorted = false;
      }
      i++;
    }
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function gnomeSort(){
  let index = 0;
  while(index < arr.length){
    if(index === 0) index++;
    uncolorAll(); color([index,index-1],'compare'); await stepDelay();
    if(arr[index] >= arr[index-1]) index++;
    else{ swap(index,index-1); index--; }
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function countingSort(){
  const maxVal = Math.max(...arr);
  const count = new Array(maxVal+1).fill(0);
  for(let i=0;i<arr.length;i++){
    count[arr[i]]++;
  }
  let idx = 0;
  for(let val=0; val<count.length; val++){
    while(count[val] > 0){
      uncolorAll(); color([idx],'compare'); await stepDelay();
      arr[idx++] = val;
      bars[idx-1].style.height = val + '%';
      count[val]--;
    }
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function radixSort(){
  const getMax = () => Math.max(...arr);
  let m = getMax();
  let exp = 1;
  while(m/exp > 1){
    await countingRadix(exp);
    exp *= 10;
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function countingRadix(exp){
  const n = arr.length;
  const output = new Array(n);
  const count = new Array(10).fill(0);
  for(let i=0;i<n;i++){
    count[Math.floor(arr[i]/exp) % 10]++;
  }
  for(let i=1;i<10;i++) count[i] += count[i-1];
  for(let i=n-1;i>=0;i--){
    const digit = Math.floor(arr[i]/exp) % 10;
    output[--count[digit]] = arr[i];
  }
  for(let i=0;i<n;i++){
    uncolorAll(); color([i],'compare'); await stepDelay();
    arr[i] = output[i];
    bars[i].style.height = arr[i] + '%';
  }
}

async function bucketSort(){
  const n = arr.length;
  const buckets = Array.from({length:10},()=>[]);
  const max = Math.max(...arr);
  for(let i=0;i<n;i++){
    const idx = Math.floor((arr[i]/(max+1)) * buckets.length);
    buckets[idx].push(arr[i]);
  }
  let k=0;
  for(let b=0;b<buckets.length;b++){
    buckets[b].sort((a,b)=>a-b);
    for(let val of buckets[b]){
      uncolorAll(); color([k],'compare'); await stepDelay();
      arr[k] = val;
      bars[k].style.height = val + '%';
      k++;
    }
  }
  bars.forEach(b=>b.classList.add('sorted'));
}

async function startSort(){
  if(running) return;
  running = true; paused = false; stopRequested = false;
  disableControls(true);
  const alg = algorithmSelect.value;
  try{
    if(alg === 'Bubble Sort') await bubbleSort();
    else if(alg === 'Selection Sort') await selectionSort();
    else if(alg === 'Insertion Sort') await insertionSort();
    else if(alg === 'Merge Sort') await mergeSortWrapper();
    else if(alg === 'Quick Sort') await quickSortWrapper();
    else if(alg === 'Heap Sort') await heapSort();
    else if(alg === 'Shell Sort') await shellSort();
    else if(alg === 'Cocktail Sort') await cocktailSort();
    else if(alg === 'Comb Sort') await combSort();
    else if(alg === 'Gnome Sort') await gnomeSort();
    else if(alg === 'Counting Sort') await countingSort();
    else if(alg === 'Radix Sort') await radixSort();
    else if(alg === 'Bucket Sort') await bucketSort();
  }catch(e){ /* stopped */ }
  running = false; disableControls(false);
}


function disableControls(dis){
  algorithmSelect.disabled = dis;
  sizeInput.disabled = dis;
  speedInput.disabled = dis;
  generateBtn.disabled = dis;
  startBtn.disabled = dis;
}

// UI wiring
generateBtn.addEventListener('click', ()=>{ generateArray(Number(sizeInput.value)); });
startBtn.addEventListener('click', ()=>{ startSort(); });
pauseBtn.addEventListener('click', ()=>{ if(!running) return; paused = !paused; pauseBtn.textContent = paused ? 'Resume' : 'Pause'; });
resetBtn.addEventListener('click', ()=>{ stopRequested = true; paused = false; pauseBtn.textContent = 'Pause'; setTimeout(()=>{ stopRequested=false; generateArray(Number(sizeInput.value)); }, 60); });

sizeInput.addEventListener('input', ()=>{ generateArray(Number(sizeInput.value)); });

// initial
generateArray(Number(sizeInput.value));ī
