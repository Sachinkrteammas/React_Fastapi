import React,{useState,useEffect} from "react";
import Layout from "../layout"; 
import "../layout.css"; 


export default function RawSales() {
  const salesData = [
    {
      id: 101,
      callDate: "Feb 26, 2025",
      empId: "MAS 5790",
      competitor: "None",
      opening: 1,
      offered: 1,
      objectionHandling: 1,
      prepaidPitch: 1,
      upsellingEfforts: 1,
      offerUrgency: 0,
      areaForImprovement: "None",
      transcript: "Very good afternoon..."
    },
    {
      id: 102,
      callDate: "Feb 26, 2025",
      empId: "MAS 5784",
      competitor: "None",
      opening: 1,
      offered: 1,
      objectionHandling: 1,
      prepaidPitch: 0,
      upsellingEfforts: 0,
      offerUrgency: 1,
      areaForImprovement: "None",
      transcript: "Hello? Very good after..."
    },
  ];

  //loading code start===>
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
       
        setTimeout(() => {
          setLoading(false);
        }, 2000); 
      }, []);
     
      if (loading) {
        return (
          <div className="loader-container">
            <div className="windows-spinner"></div>
            <p className="Loading">Loading...</p>
          </div>
        );
      }
      //loading code end==>

  return (
    <Layout>
      <div className="header">
        <h5>AI-Enhanced Sales Strategy Dashboard</h5>
        <div className="salesheader">
          <label>
            <input
              type="date"
              name="start_date"
              //   value={formData.start_date}
              //   onChange={handleChange}
              required
            />
          </label>
          <label>
            <input
              type="date"
              name="end_date"
              //   value={formData.end_date}
              //   onChange={handleChange}
              required
            />
          </label>
          <label>
            <input type="submit" class="setsubmitbtn" value="Submit" />
          </label>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <table className="sales-table" style={{fontSize:"16px"}}>
          <thead>
            <tr>
              <th className="table-header">ID</th>
              <th className="table-header">Call Date</th>
              <th className="table-header">Emp ID</th>
              <th className="table-header">Competitor</th>
              <th className="table-header">Opening</th>
              <th className="table-header">Offered</th>
              <th className="table-header">Objection Handling</th>
              <th className="table-header">Prepaid Pitch</th>
              <th className="table-header">Upselling Efforts</th>
              <th className="table-header">Offer Urgency</th>
              <th className="table-header">Area for Improvement</th>
              <th className="table-header">Transcript</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((row, index) => (
              <tr key={index} className="table-row">
                <td className="table-cell">{row.id}</td>
                <td className="table-cell">{row.callDate}</td>
                <td className="table-cell">{row.empId}</td>
                <td className="table-cell">{row.competitor}</td>
                <td className="table-cell">{row.opening}</td>
                <td className="table-cell">{row.offered}</td>
                <td className="table-cell">{row.objectionHandling}</td>
                <td className="table-cell">{row.prepaidPitch}</td>
                <td className="table-cell">{row.upsellingEfforts}</td>
                <td className="table-cell">{row.offerUrgency}</td>
                <td className="table-cell">{row.areaForImprovement}</td>
                <td className="table-cell">{row.transcript}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </Layout>
  );
}