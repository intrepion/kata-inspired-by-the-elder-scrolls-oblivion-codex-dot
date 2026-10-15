if(new URLSearchParams(location.search).get('mode')==='classic')void import('./legacy');
else void import('./action-mode');
