function c(n){return t=>{const r=t.currentTarget.value;if(r===""){n("");return}const u=r.replace(/\D/g,"").replace(/^0+(\d)/,"$1");let e=Number(u);(isNaN(e)||e<0)&&(e=0),n(String(e))}}export{c as H};
