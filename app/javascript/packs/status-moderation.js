import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import cc from "classnames";

const tabUngrouped = "ungrouped";
const tabGroupedByIp = "grouped-by-ip";
const ipCidr = /\/32$/;
const blank = "";
const lineBreaksPattern = /\n/g;
const multiSpacePattern = /\s{2,}/g;
const doublequotesPattern = /"/g;

function tableToCSV() {
  // each <TR>
  return Array.from(document.querySelectorAll("#favourites-analyzer tr"))
    .map(function (rowElement) {
      // each <TH> or <TD>
      return Array.from(rowElement.querySelectorAll("th,td"))
        .map(function (cell) {
          // to text

          // preserve spaces between username links
          let text = Array.from(cell.childNodes)
            .map(el =>
              (el.innerText || el.textContent || el.nodeValue || "").trim()
            )
            .join(" ")
            .trim();

          let shouldQuote = false;

          if (text.includes('"')) {
            // strings with a quote " convert to ""
            text = text.replace(doublequotesPattern, '""');
            shouldQuote = true;
          }

          if (text.includes(",") || shouldQuote) {
            text = `"${text}"`;
          }

          text = text
            .replace(lineBreaksPattern, " ")
            .replace(multiSpacePattern, " ")
            .trim();

          return text;
        })
        .join(","); // <--to comma-delimited row
    })
    .join("\n");
}

function downloadCSVFile(evt) {
  evt.preventDefault();
  const data = tableToCSV();
  const file = new Blob([data], { type: "text/csv" });
  const downloadAnchor = document.createElement("a");
  downloadAnchor.download =
    window.location.href.split("/").pop() + "-favourites.csv";
  const url = window.URL.createObjectURL(file);
  downloadAnchor.href = url;
  downloadAnchor.style.display = "none";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

function groupedByIpDescending(a, b) {
  if (a.count < b.count) {
    return 1;
  } else if (a.count > b.count) {
    return -1;
  }
  return 0;
}

class StatusModeration extends React.Component {
  state = {
    tab: tabGroupedByIp,
    showMeta: false,
    fullscreen: false,
    favourites: []
  };

  componentDidMount() {
    this.loadFavourites();
  }

  loadFavourites() {
    const favourites = JSON.parse(
      document.getElementById("status-moderation-data").innerHTML
    ).map(function (row) {
      if (row.id === null) {
        delete row.id;
      }
      row.current_sign_in_ip = row.current_sign_in_ip.replace(ipCidr, blank);
      row.last_sign_in_ip = row.last_sign_in_ip.replace(ipCidr, blank);
      return row;
    });
    this.setState({ favourites });
  }

  tab = t => this.setState({ tab: t });

  // Toggle a state boolean by key
  toggle = key => this.setState({ [key]: !this.state[key] });

  renderUngroupedTable() {
    const { favourites, showMeta } = this.state;
    return (
      <table className="table">
        <thead>
          <tr>
            {showMeta && <th>favourite_id</th>}
            {showMeta && <th>favourite_created_at</th>}
            {showMeta && <th>updated_at</th>}
            {showMeta && <th>account_id</th>}
            {showMeta && <th>user_id</th>}
            {showMeta && <th>user_created_at</th>}
            <th>username</th>
            <th>display_name</th>
            <th>current_sign_in_ip</th>
            <th>last_sign_in_ip</th>
          </tr>
        </thead>
        <tbody>
          {favourites.map((row, index) => (
            <tr key={`cell-${index}`}>
              {showMeta && <td>{row.favourite_id}</td>}
              {showMeta && <td>{row.favourite_created_at}</td>}
              {showMeta && <td>{row.updated_at}</td>}
              {showMeta && <td>{row.account_id}</td>}
              {showMeta && <td>{row.user_id}</td>}
              {showMeta && <td>{row.user_created_at}</td>}
              <td>{row.username}</td>
              <td>{row.display_name}</td>
              <td>{row.current_sign_in_ip}</td>
              <td>{row.last_sign_in_ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  /**
   * Groups favourites by IP. It's a little confusing. The favourites
   * are grouped into an object then converted back into an array. It could
   * be done in a single reduce but that is even more awkward looking.
   * @returns {object}
   */
  renderGroupedByIpTable() {
    let groups = {};

    this.state.favourites.forEach(function (row) {
      const { current_sign_in_ip: ip } = row;
      if (groups[ip] === undefined) {
        groups[ip] = { ip, count: 0, rows: [] };
      }
      groups[ip].count += 1;
      groups[ip].rows.push(row);
    });

    const rows = Object.entries(groups)
      .map(([_, row]) => row)
      .sort(groupedByIpDescending);

    return (
      <table className="table">
        <thead>
          <tr>
            <th>IP</th>
            <th>Count</th>
            <th>Users</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`cell-${rowIndex}`}>
              <td>{row.ip}</td>
              <td>{row.count}</td>
              <td>
                {row.rows.map((subRow, subRowIndex) => (
                  <a
                    key={`user-link-${subRowIndex}`}
                    style={{ display: "inline-block", marginRight: "0.3rem" }}
                    href={`/admin/accounts/${subRow.user_id}`}
                  >
                    {subRow.username}
                  </a>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    const { tab, showMeta, fullscreen } = this.state;
    const table =
      tab === tabUngrouped
        ? this.renderUngroupedTable()
        : this.renderGroupedByIpTable();

    const outerStyle = fullscreen
      ? {
          backgroundColor: "#292929",
          boxShadow: "2px 2px 0 rgba(0, 0, 0, 0.2)",
          position: "fixed",
          overflow: "auto",
          padding: "0.6rem",
          left: "10px",
          top: "10px",
          bottom: "10px",
          right: "10px"
        }
      : undefined;

    return (
      <div id="favourites-analyzer" style={outerStyle}>
        <div className="filters">
          <div className="filter-subset">
            <strong>Favourites</strong>
            <ul>
              <li>
                <a
                  className={cc({ selected: tab === tabGroupedByIp })}
                  onClick={() => this.tab(tabGroupedByIp)}
                >
                  grouped by ip
                </a>
              </li>
              <li>
                <a
                  className={cc({ selected: tab === tabUngrouped })}
                  onClick={() => this.tab(tabUngrouped)}
                >
                  ungrouped
                </a>
              </li>
              <li>
                <label title="show meta data like ids" htmlFor="show-meta">
                  Meta?
                  <input
                    id="show-meta"
                    type="checkbox"
                    checked={showMeta}
                    onChange={() => this.toggle("showMeta")}
                  />
                </label>
              </li>
              <li>
                <label title="put this table fullscreen" htmlFor="fullscreen">
                  Fullscreen?
                  <input
                    id="fullscreen"
                    type="checkbox"
                    checked={fullscreen}
                    onChange={() => this.toggle("fullscreen")}
                  />
                </label>
              </li>
              <li>
                <button onClick={downloadCSVFile}>
                  CSV<i className="fa fa-download"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="table-wrapper">{table}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <StatusModeration />,
  document.getElementById("status-moderation")
);
