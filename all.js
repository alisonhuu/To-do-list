const url = 'https://todoo.5xcamp.us';

function swalSuccess(msg='成功', func){ 
  Swal.fire({
    icon: 'success',
    title: msg,
    confirmButtonColor: '#8fc0a9',
    confirmButtonText: '確認'
  }).then((result) => {
    if(result.isConfirmed){
      func
    }})
 }

 function swalError(msg, text){ 
  Swal.fire({
    icon: 'error',
    title: msg,
    text: text,
    confirmButtonColor: '#8fc0a9'
  })
 }

 // log in
const logIn = document.querySelector('#logIn');
const emailLog = document.querySelector('#email-log');
const passwordLog = document.querySelector('#password-log')
const preSignUp = document.querySelector('#preSignUp');
const toLogIn = document.querySelector('#toLogIn');
const nickNameTitle = document.querySelector('.nickName')

function getLogIn(e){
  e.preventDefault();
  axios.post(`${url}/users/sign_in`, {
    "user": {
      "email": emailLog.value,
      "password": passwordLog.value
    }
  })
  .then(res => {
    console.log(res)
    axios.defaults.headers.common['Authorization'] = res.headers.authorization;
    nickNameTitle.textContent = `${res.data.nickname}的待辦`;
    swalSuccess(res.data.message, goTodoList())
  })
  .catch(error => {
    if(error.response){
      console.log(error.response)
      swalError(error.response.data.message);
      toLogIn.reset();
    }
  })
}

function goSignUp(e){
  e.preventDefault();
  logIn.classList.add('none');
  signUp.classList.remove('none');
}

toLogIn.addEventListener('submit', getLogIn);
preSignUp.addEventListener('click', goSignUp);

// sign up
const signUp = document.querySelector('#signUp');
const email =document.querySelector('#email');
const nickName =document.querySelector('#nickName');
const password =document.querySelector('#password');
const passwordCfd =document.querySelector('#password-cfd');
const toSignUp = document.querySelector('#toSignUp');
const preLogIn = document.querySelector('#preLogIn');

function passwordValidity(e){
  e.target.setCustomValidity('密碼格式為含英數至少6位')
}

function passwordCfdValidity(e){
  if(e.target.value !== password.value){
    e.target.setCustomValidity('密碼不吻合')
  }
}

function getSignUp(e){
  e.preventDefault();
  axios.post(`${url}/users`,{
    "user": {
      "email": email.value,
      "nickname": nickName.value,
      "password": password.value
    }
  })
  .then((res) => {
    console.log(res, res.data.message);
    swalSuccess(res.data.message, goLogIn());
  })
  .catch(error => {
    if(error.response){
      console.log(error.response)
      swalError(error.response.data.error, error.response.data.message);
      toSignUp.reset();
    }
  })
}

function goLogIn(){
  signUp.classList.add('none');
  logIn.classList.remove('none');
}

password.addEventListener('invalid', passwordValidity);
password.addEventListener('input', (e)=>password.setCustomValidity(''));
passwordCfd.addEventListener('change', passwordCfdValidity);
passwordCfd.addEventListener('input', (e)=>passwordCfd.setCustomValidity(''));
toSignUp.addEventListener('submit', getSignUp);
preLogIn.addEventListener('click', goLogIn);

// todo list
const todoList = document.querySelector('#todoList');
let data = [];
const cardList = document.querySelector('.card_list')
const list = document.querySelector('.list');
const listFooter = document.querySelector('.list_footer')
const text = document.querySelector('.input input[type="text"]');
const btn_add = document.querySelector('.btn_add');
const tab = document.querySelector('.tab');
const tabs = tab.querySelectorAll('li');
const empty = document.querySelector('.empty');
const logOut = document.querySelector('#logOut');

function goTodoList(){
  logIn.classList.add('none');
  todoList.classList.remove('none');
  tabs.forEach( item => {
    if (item.innerText === '全部' ){
      item.classList.add('active')
    }
  })
  getList()
}

function getList() {
  axios.get(`${url}/todos`)
  .then(res => {
    console.log(res)
    data = res.data.todos
    if(data.length !== 0){
      cardList.style.display = "block";
      empty.classList.add('none');
    }else{
      cardList.style.display = "none";
      empty.classList.remove('none');
    }
    let showData= []
    tabs.forEach(item => {
      if(item.getAttribute('class') === 'active'){
        if(item.innerText === '全部'){
          showData = data;
        } else if(item.innerText === '待完成'){
          showData = data.filter(item => item.completed_at === null)
        } else if(item.innerText === '已完成'){
          showData = data.filter(item => item.completed_at !== null)
        }     
      }
    })
    render(showData);
  })
  .catch(error => console.log(error.response))
}

function render(data) {
  let str ='';
  data.forEach((item) => { str += 
    `<li data-num="${item.id}">
    <div class="checkbox">
      <input type="checkbox" id="checkbox" ${item.completed_at ? 'checked' : '' }/>
      <label for="checkbox">${ item.content }</label>
      <input type="text" class="edit none">
      <a href="#" class="editBtn">編輯</a>
    </div>
    <a href="#" class="delete"></a>
  </li>` 
  });
  list.innerHTML = str; 
  let count = 0;
  data.forEach(item => {
    if(item.completed_at === null)
    count += 1;
  })
  listFooter.innerHTML = ` <p>${ count } 個待完成項目</p>
    <a href="#">清除已完成項目</a>`
  }

function add(e){
  e.preventDefault();
  if(text.value.trim() === ''){
    swalError('新增失敗','請輸入待辦事項！');
    return
  }
  axios.post(`${url}/todos`,{
    "todo": {
      "content": text.value
    }
  })
  .then(res => {
    console.log(res)
    tabs.forEach( item => {
      if (item.innerText === '全部' ){
        item.classList.add('active')
      } else {
        item.classList.remove('active')
      }
    })
    getList();
    text.value = ''
  })
  .catch(error => console.log(error.response))
}

function handleItem(e){
  let num = e.target.closest("li").dataset.num;
  if(e.target.classList.contains('delete')){
    e.preventDefault();
    axios.delete(`${url}/todos/${num}`)
    .then(res => {
      console.log(res)
      swalSuccess(res.data.message, getList())
    })
    .catch(error => console.log(error.response))
  } else if(e.target.getAttribute('type')==='checkbox') {
    console.log(e)
    axios.patch(`${url}/todos/${num}/toggle`, {})
      .then(res => {
        console.log(res)
        getList();
      })
      .catch(error => console.log(error.response))
    }else if(e.target.classList.contains('editBtn')){
      let checkboxContent = this.querySelector(`li[data-num='${num}'] label`)
      let edit = this.querySelector(`li[data-num='${num}'] .edit`)
      checkboxContent.classList.toggle('none');
      edit.classList.toggle('none');
      if(checkboxContent.classList.contains('none')){
        e.target.textContent = '完成';
        data.forEach(item => {
          if(item.id === num){
            edit.value = item.content
          }
        })
      }else{
        e.target.textContent = '編輯';
        axios.put(`${url}/todos/${num}`, {
          "todo": {
            "content": edit.value
          }
        })
      .then(res => {
        console.log(res)
        getList()
      })
      .catch(error => console.log(error.response))
      }
    }
  }

function switchTab(e){ 
  tabs.forEach(item => {
    if(item.getAttribute('class')==='active'){
      item.classList.remove('active')
    }
  });
  e.target.classList.add('active');
  getList();
}

function deleteChecked(e){
  if(e.target.nodeName !== 'A') return
  e.preventDefault();
  let deleteAll = [];
  deleteAll = data.map((item => {
    if(item.completed_at !== null){
      return axios.delete(`${url}/todos/${item.id}`)
    }
  })).filter(item => item !== undefined)

  Promise.all(deleteAll)
  .then(res => {
    console.log(res)
    swalSuccess('已清除所有完成項目', getList())
  })
  .catch(error => console.log(error))
}

function toLogOut(){
  axios.delete(`${url}/users/sign_out`)
      .then(res => {
        console.log(res)
        todoList.classList.add('none');
        swalSuccess(res.data.message, goLogIn())
      })
      .catch(error => console.log(error.response))
} 

btn_add.addEventListener('click', add);
list.addEventListener('click', handleItem);
tab.addEventListener('click', switchTab);
listFooter.addEventListener('click', deleteChecked);
logOut.addEventListener('click', toLogOut);