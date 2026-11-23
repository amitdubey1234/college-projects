// #include<iostream>
// using namespace std ;
// #define n 100
// class stack{
//     int* arr;
//     int top;
//     public:
//     stack(){
//         arr=new int [n];
//         top=-1;

//     }
//     void push(int x){
//         if(top==n-1){
//             cout<<"overflow";

//         }else{
//             top++;
//             arr[top]=x;
//         }
//     }
//     void pop(){
//         if(top==-1){
//             cout<<"under flow";
//         } else {
//             top--;
//         }
//     }
//     int Top(){
//         if(top==-1){
//             cout<<"empty";
//             return -1;
//         }else {
//             cout<<"at top this element is present"<<arr[top]<<endl;
//             return arr[top];
//         }
        
//     }
//     bool isEmpty(){
//         return  top==-1;
//     }
//     void display(){
//         if(isEmpty()){
//             cout<<"empty";
//         }else{
//             for(int i=0;i<top;i++){
//                 cout<<arr[i];
//             }
//         }
//     }
// };
// int main(){
//     stack s;
//     s.push(3);
//     s.push(4);
//     s.push(5);
//     cout<<s.Top()<<endl;
//     s.pop();
//     s.display();
//     cout<<s.Top()<<endl;
//     s.pop();
//     s.pop();
//     s.isEmpty();
//     return 0;
// }
#include<iostream>
#include<stack>

using namespace std ;
// void reverseSentence(string s){
//     stack<string>st;
//     for(int i=0;i<s.length();i++){
//         string word="";
//         while(s[i]!=' ' && i<s.length()){
//             word+=s[i];
//             i++;
//         } st.push(word);
//     }
//     while(!st.empty()){
//         cout<<st.top()<<"";
//         st.pop();
//     }cout<<endl;
// }
// int main(){
//     string s="hello how are you ";
//     reverseSentence(s);
// }
