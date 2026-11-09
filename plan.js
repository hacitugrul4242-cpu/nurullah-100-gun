/* Nurullah için sıfırdan kurulan 100 günlük konu yerleşimi.
   Yusuf projesinin ders takvimi veya tamamlanma listesi kullanılmaz.
   Oturumlar standart konu adlarıyla görünür; alt kazanımlar referans PDF'dedir. */
(function () {
  'use strict';
  var CATALOG = window.NURULLAH_CATALOG || [];
  var PLAN = Array.from({length:100},function(_,i){
    return {day:i+1,phase:'',tasks:[],routines:[],checks:[]};
  });
  var ranges = {
    'tyt-mat':[1,41], 'ayt-mat':[42,94],
    'tyt-geo':[4,60], 'ayt-geo':[61,94],
    'tyt-tur':[1,52],
    'tyt-fiz':[1,40], 'ayt-fiz':[41,95],
    'tyt-kim':[1,38], 'ayt-kim':[39,95],
    'tyt-biy':[1,38], 'ayt-biy':[39,95],
    'tyt-tar':[4,87], 'tyt-cog':[3,85],
    'tyt-fel':[22,88], 'tyt-din':[5,91]
  };
  var ordered = [
    'tyt-mat','ayt-mat','tyt-geo','ayt-geo','tyt-tur',
    'tyt-fiz','tyt-kim','tyt-biy','ayt-fiz','ayt-kim','ayt-biy',
    'tyt-cog','tyt-tar','tyt-fel','tyt-din'
  ];
  var findCourse = function(id){return CATALOG.find(function(c){return c.id===id})};
  function workload(day,course) {
    var a=PLAN[day-1].tasks;
    var similar=a.filter(function(x){return x.color===course.color}).length;
    var exact=a.filter(function(x){return x.courseId===course.id}).length;
    var fen=['fiz','kim','biy'].includes(course.color);
    return a.length*0.65 + similar*(fen?2.8:1.8) + exact*8;
  }
  function distribute(course) {
    var window=ranges[course.id],start=window[0],end=window[1];
    var expanded=[];
    course.topics.forEach(function(t){
      for(var p=1;p<=t.sessions;p++){
        expanded.push({
          id:'topic:'+t.id+':'+p,topicId:t.id,courseId:course.id,
          course:course.name,color:course.color,exam:course.exam,
          label:t.title+(t.sessions>1?' ('+p+'/'+t.sessions+')':'')
        });
      }
    });
    var last=start-1, n=expanded.length;
    expanded.forEach(function(task,i){
      var ideal=n>1?start+Math.round(i*(end-start)/(n-1)):start;
      var min=Math.max(start,last+1,ideal-3);
      var max=Math.min(end-(n-i-1),ideal+3);
      if(min>max){
        min=Math.max(start,last+1);
        max=end-(n-i-1);
      }
      if(min>max){throw Error('Gün yerleşimi mümkün değil: '+course.id);}
      var best=min,bestScore=Infinity;
      for(var d=min;d<=max;d++){
        var penalty=Math.abs(d-ideal)*1.9+workload(d,course);
        if(penalty<bestScore){best=d;bestScore=penalty;}
      }
      PLAN[best-1].tasks.push(task);last=best;
    });
  }
  ordered.forEach(function(id){
    var course=findCourse(id);
    if(!course)throw Error('Ders bulunamadı: '+id);
    distribute(course);
  });
  PLAN.forEach(function(d){
    var day=d.day;
    d.phase=day<=35?'TYT Temel İnşası':day<=60?'TYT Tamamlama + AYT Geçiş':day<=90?'AYT Derinleşme':'Konu Kapatma + Deneme';
    d.tasks.sort(function(a,b){
      var rank={mat:0,geo:1,fiz:2,kim:3,biy:4,tur:5,sos:6};
      return (rank[a.color]||0)-(rank[b.color]||0);
    });
    d.routines=[
      {id:'routine:'+day+':paragraf',label:'Paragraf çalışması ve yanlış analizi'},
      {id:'routine:'+day+':problem',label:'Problem çözme ve işlem pratiği'}
    ];
    if(day%3===0){
      d.routines.push({id:'routine:'+day+':geo',label:'Geometri kazanım pekiştirmesi'});
    }
    if(day%7===0){
      d.checks.push({id:'check:'+day+':weekly',label:'Haftalık tekrar, eksik tespiti ve onarım'});
    }
    if(day>=28&&day<91&&day%14===0){
      d.checks.push({id:'check:'+day+':branch',label:day<=56?'TYT branş uygulaması ve hata analizi':'AYT branş uygulaması ve hata analizi'});
    }
    if(day>=96){
      d.checks.push({id:'check:'+day+':exam',label:day%2===0?'TYT genel deneme ve ayrıntılı analiz':'AYT genel deneme ve ayrıntılı analiz'});
      d.checks.push({id:'check:'+day+':repair',label:'Denemede ortaya çıkan bilgi açıklarını kapatma'});
    }
  });
  var covered=new Set();
  PLAN.forEach(function(d){d.tasks.forEach(function(t){covered.add(t.topicId)})});
  var totalTopics=CATALOG.reduce(function(n,c){return n+c.topics.length},0);
  var totalSessions=CATALOG.reduce(function(n,c){
    return n+c.topics.reduce(function(k,t){return k+t.sessions},0);
  },0);
  if(PLAN.length!==100 || covered.size!==totalTopics ||
     PLAN.reduce(function(n,d){return n+d.tasks.length},0)!==totalSessions){
    throw Error('Plan kapsam denetimi başarısız');
  }
  window.NURULLAH_PLAN=PLAN;
  window.NURULLAH_AUDIT={
    days:100,courseGroups:CATALOG.length,
    topics:covered.size,sessions:totalSessions,
    scheduledTopics:totalTopics,
    maxDailySubjects:Math.max.apply(null,PLAN.map(function(d){return d.tasks.length})),
    minDailySubjects:Math.min.apply(null,PLAN.map(function(d){return d.tasks.length})),
    methodology:'2026 MEB kazanımlarına dayanan 2027 çalışma taslağı. Konu anlatımı tek başına yeterlilik garantisi değildir.'
  };
})();