//BUBBLE SORT (4,1,5,2,3)
#include<iostream>
using namespace std ;
void bubblesort(int a[],int n){
    for(int i=0;i<n-1;i++){
        for(int j=0;j<n-1-i;j++){
        if(a[j] >a[j+1]){
            int temp=a[j];
            a[j]=a[j+1];
            a[j+1]=temp;
        }
    }
    }
}
void selectionsort(int a[],int n) {
    for(int i=0;i<n-1;i++){
        int si=i;
        for(int j=i+1;j<n;j++){
            if(a[j]<a[si]){
                si=j;
            }
        }
        int temp=a[i];
        a[i]=a[si];
        a[si]=temp;
    }
}
void insertionsort(int a[],int n){
    for(int i=1;i<n;i++){
        int curr =a[i];
        int prev=i-1;
 while (prev>=0&&a[prev]>curr){
    a[prev+1]=a[prev];
    prev--;
 }
    
     a[prev+1]=curr;//placing the curr ele at its current position 
    }
}
void printArray(int a[],int n){
    for(int i=0;i<n;i++){
        cout<<a[i]<<" ";
    }
    cout<<endl;
}
int main(){
    int n=5;
    int a[]={4,1,5,2,3};
    cout<<"bubble sort ";
    //bubblesort(a,n);
    printArray(a,n);
    //selectionsort(a,n);
    insertionsort(a,n);
    printArray(a,n);
    return 0;
}