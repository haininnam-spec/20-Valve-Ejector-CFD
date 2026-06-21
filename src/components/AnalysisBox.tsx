"use client";
import React from 'react';

interface AnalysisBoxProps {
  vacuum: number;
}

const AnalysisBox: React.FC<AnalysisBoxProps> = ({ vacuum }) => {
  return (
    <div className="analysis-container mt-6 mb-12">
      <div className="glass-panel analysis-box">
        <h3>
          <span className="icon">📋</span> 최인남(기계공학 석사)의 현장 가이드
        </h3>
        
        <ul>
          <li>
            <strong>조건 변경:</strong> 흡입측 1/2&quot; 호스 <span className="highlight-yellow">1m 적용</span> (압력 손실 반영됨).
          </li>
          <li>
            <strong>사운드:</strong> 소음기 OFF 시 가동음 발생 (터치/조작 시 자동 활성화).
          </li>
          <li>
            <strong>현재 상태:</strong> 측정된 부압은 <span className="highlight-blue">{vacuum.toFixed(2)} bar</span> 입니다.
          </li>
          <li style={{ marginTop: '10px' }}>
            <strong>🚨 최대 위험 대응:</strong> 가스 역류 및 누출 방지를 위해 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>30분 간격으로 가스 농도 측정</span> 및 상시 환기 프로토콜 준수 요망.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AnalysisBox;
