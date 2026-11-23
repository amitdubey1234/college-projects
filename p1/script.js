const books = [
 {id:1,title:"The Midnight Library",author:"Matt Haig",category:"Fiction",price:399,oldPrice:499,rating:4.9,badge:"BESTSELLER",cover:"#2e4d4a",ink:"#f1d7a6",coverTitle:"THE<br>MIDNIGHT<br>LIBRARY"},
 {id:2,title:"Atomic Habits",author:"James Clear",category:"Self-help",price:449,oldPrice:599,rating:4.9,badge:"READER FAVOURITE",cover:"#d6c6a1",ink:"#273f32",coverTitle:"ATOMIC<br>HABITS"},
 {id:3,title:"The Psychology of Money",author:"Morgan Housel",category:"Business",price:349,oldPrice:450,rating:4.8,badge:"",cover:"#557a78",ink:"#f5e5c5",coverTitle:"THE<br>PSYCHOLOGY<br>OF MONEY"},
 {id:4,title:"Pride and Prejudice",author:"Jane Austen",category:"Classics",price:299,oldPrice:399,rating:4.8,badge:"TIMELESS",cover:"#d7b3a2",ink:"#5a3937",coverTitle:"PRIDE &<br>PREJUDICE"},
 {id:5,title:"Ikigai",author:"Héctor García",category:"Self-help",price:279,oldPrice:350,rating:4.7,badge:"",cover:"#e4d9b7",ink:"#49644e",coverTitle:"IKIGAI"},
 {id:6,title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",price:319,oldPrice:399,rating:4.8,badge:"BOOK CLUB PICK",cover:"#c98252",ink:"#fff0cf",coverTitle:"THE<br>ALCHEMIST"},
 {id:7,title:"Deep Work",author:"Cal Newport",category:"Business",price:429,oldPrice:550,rating:4.7,badge:"",cover:"#324c62",ink:"#e5d4a9",coverTitle:"DEEP<br>WORK"},
 {id:8,title:"The Great Gatsby",author:"F. Scott Fitzgerald",category:"Classics",price:259,oldPrice:329,rating:4.6,badge:"",cover:"#c9b979",ink:"#39453b",coverTitle:"THE GREAT<br>GATSBY"}
];
let cart = [];
let wishlist = [];
let activeCategory = "All";
let searchTerm = "";
const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + n.toLocaleString("en-IN");

function renderBooks(){
  let list = books.filter(b => (activeCategory==="All" || b.category===activeCategory) &&
    (b.title.toLowerCase().includes(searchTerm) || b.author.toLowerCase().includes(searchTerm) || b.category.toLowerCase().includes(searchTerm)));
  const sort = $("sortSelect").value;
  if(sort==="low") list.sort((a,b)=>a.price-b.price);
  if(sort==="high") list.sort((a,b)=>b.price-a.price);
  if(sort==="rating") list.sort((a,b)=>b.rating-a.rating);
  $("bookGrid").innerHTML = list.map(b=>`
    <article class="book-card">
      <div class="book-cover-wrap">
        ${b.badge?`<span class="book-badge">${b.badge}</span>`:""}
        <button class="wishlist-btn ${wishlist.includes(b.id)?"active":""}" data-wish="${b.id}" aria-label="Add ${b.title} to wishlist">${wishlist.includes(b.id)?"♥":"♡"}</button>
        <div class="book-cover" style="background:${b.cover};color:${b.ink}">
          <span class="cover-mini">BOOKSHELL EDITION</span><span class="cover-name">${b.coverTitle}</span><span class="cover-art"></span><span class="cover-author">${b.author.toUpperCase()}</span>
        </div>
        <div class="quick-add"><button data-add="${b.id}">＋ Add to bag — ${money(b.price)}</button></div>
      </div>
      <div class="book-info"><span class="book-category">${b.category}</span><div class="book-title-row"><h3 class="book-title">${b.title}</h3><span class="rating">★ ${b.rating}</span></div><p class="book-author">by ${b.author}</p><div class="price-row"><span class="price">${money(b.price)}</span><span class="old-price">${money(b.oldPrice)}</span></div></div>
    </article>`).join("");
  $("emptyState").hidden = list.length!==0;
  $("bookGrid").hidden = list.length===0;
  $("resultCount").textContent = `${list.length} ${list.length===1?"book":"books"}`;
}
function updateCounts(){
  $("cartCount").textContent = cart.reduce((sum,item)=>sum+item.qty,0);
  $("panelCartCount").textContent = `(${cart.reduce((sum,item)=>sum+item.qty,0)})`;
  $("wishCount").textContent = wishlist.length;
}
function renderCart(){
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  $("cartItems").innerHTML = cart.map(item=>{
    const b=books.find(book=>book.id===item.id);
    return `<div class="cart-line"><div class="mini-cover" style="background:${b.cover};color:${b.ink}">${b.coverTitle.replace(/<br>/g," ")}</div><div><h4>${b.title}</h4><p>${money(b.price)} each</p><div class="qty-controls"><button data-qty="${b.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${b.id}" data-change="1" aria-label="Increase quantity">+</button></div><button class="remove-item" data-remove="${b.id}">Remove</button></div><strong class="line-price">${money(b.price*item.qty)}</strong></div>`;
  }).join("");
  $("cartEmpty").style.display=count===0?"block":"none";
  $("cartFooter").style.display=count===0?"none":"block";
  const subtotal=cart.reduce((sum,item)=>sum+books.find(b=>b.id===item.id).price*item.qty,0);
  $("subtotal").textContent=money(subtotal);
  $("checkoutTotal").textContent=money(subtotal);
  updateCounts();
}
function addToCart(id){
  const found=cart.find(item=>item.id===id);
  if(found) found.qty++; else cart.push({id,qty:1});
  renderCart(); showToast(`${books.find(b=>b.id===id).title} added to your bag`);
}
function showToast(message){
  $("toast").textContent=message;$("toast").classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$("toast").classList.remove("show"),2200);
}
function openCart(){
  $("overlay").classList.add("open");$("cartPanel").classList.add("open");document.body.style.overflow="hidden";
}
function closePanels(){
  $("overlay").classList.remove("open");$("cartPanel").classList.remove("open");document.body.style.overflow="";
}
function setCategory(category){
  activeCategory=category;
  document.querySelectorAll(".filter-chip").forEach(btn=>btn.classList.toggle("active",btn.dataset.category===category));
  renderBooks();$("bestsellers").scrollIntoView({behavior:"smooth",block:"start"});
}

$("bookGrid").addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");
  const wish=e.target.closest("[data-wish]");
  if(add) addToCart(Number(add.dataset.add));
  if(wish){
    const id=Number(wish.dataset.wish);
    wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];
    renderBooks();updateCounts();
    showToast(wishlist.includes(id)?"Added to your wishlist":"Removed from your wishlist");
  }
});
document.querySelectorAll(".filter-chip").forEach(btn=>btn.addEventListener("click",()=>setCategory(btn.dataset.category)));
document.querySelectorAll(".category-card").forEach(btn=>btn.addEventListener("click",()=>setCategory(btn.dataset.category)));
$("searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderBooks()});
$("sortSelect").addEventListener("change",renderBooks);
$("resetFilters").addEventListener("click",()=>{activeCategory="All";searchTerm="";$("searchInput").value="";setCategory("All")});
$("cartToggle").addEventListener("click",openCart);
$("overlay").addEventListener("click",closePanels);
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",closePanels));
$("cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]"),remove=e.target.closest("[data-remove]");
  if(qty){
    const item=cart.find(i=>i.id===Number(qty.dataset.qty));
    item.qty+=Number(qty.dataset.change);
    if(item.qty<=0) cart=cart.filter(i=>i.id!==item.id);
    renderCart();
  }
  if(remove){cart=cart.filter(i=>i.id!==Number(remove.dataset.remove));renderCart()}
});
$("checkoutBtn").addEventListener("click",()=>{$("checkoutModal").classList.add("open")});
$("closeCheckout").addEventListener("click",()=>$("checkoutModal").classList.remove("open"));
$("finishCheckout").addEventListener("click",()=>{$("checkoutModal").classList.remove("open");closePanels();showToast("Thanks for exploring Bookshell!");});
$("checkoutModal").addEventListener("click",e=>{if(e.target===$("checkoutModal"))$("checkoutModal").classList.remove("open")});
$("wishlistToggle").addEventListener("click",()=>{
  if(!wishlist.length){showToast("Your wishlist is empty — tap ♡ on a book to save it");return}
  activeCategory="All";searchTerm="";$("searchInput").value="";
  renderBooks();
  $("bookGrid").querySelectorAll(".book-card").forEach(card=>{
    const btn=card.querySelector("[data-wish]");
    if(!wishlist.includes(Number(btn.dataset.wish))) card.style.display="none";
  });
  $("resultCount").textContent=`${wishlist.length} saved ${wishlist.length===1?"book":"books"}`;
  document.querySelectorAll(".filter-chip").forEach(btn=>btn.classList.toggle("active",btn.dataset.category==="All"));
  $("bestsellers").scrollIntoView({behavior:"smooth"});
});
$("searchToggle").addEventListener("click",()=>{$("searchInput").focus();$("bestsellers").scrollIntoView({behavior:"smooth"})});
$("menuBtn").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
$("newsletterForm").addEventListener("submit",e=>{
  e.preventDefault();const email=$("emailInput").value.trim();
  $("newsletterMessage").textContent=`You're on the list! Welcome, ${email}.`;
  $("newsletterMessage").style.color="var(--green)";$("emailInput").value="";
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closePanels();$("checkoutModal").classList.remove("open")}});
renderBooks();renderCart();
