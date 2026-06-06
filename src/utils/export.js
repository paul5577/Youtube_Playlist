export function exportToCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateContentCalendar(channelInfo, weeks = 12) {
  const rows = [];
  const today = new Date();
  const days = channelInfo.uploadDays || ['화', '금'];
  const dayMap = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };

  let videoNum = 1;
  for (let week = 0; week < weeks; week++) {
    for (const day of days) {
      const targetDay = dayMap[day] ?? 2;
      const date = new Date(today);
      date.setDate(today.getDate() + week * 7 + ((targetDay - today.getDay() + 7) % 7));

      rows.push({
        '번호': videoNum,
        '날짜': date.toLocaleDateString('ko-KR'),
        '요일': day,
        '제목 (초안)': `[${channelInfo.category || '카테고리'}] 영상 ${videoNum} - 제목 입력`,
        '서브타이틀': '부제목 / 후킹 문구',
        '키워드': channelInfo.keywords || '',
        '설명문구': `${channelInfo.channelName || '채널명'} | 영상 설명 | #태그1 #태그2`,
        '썸네일 아이디어': '주요 텍스트 + 이미지 컨셉',
        '상태': week === 0 && videoNum === 1 ? '촬영완료' : '기획중',
        '조회수 목표': videoNum === 1 ? '5,000' : '10,000+',
        'Make 자동화': 'YES',
        '메모': '',
      });
      videoNum++;
    }
  }
  return rows;
}
