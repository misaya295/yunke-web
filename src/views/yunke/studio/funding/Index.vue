<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 状态码 -->
      <el-select v-model="funding.state" placeholder="状态" style="width: 110px" class="filter-item">
        <el-option v-for="item in statusTable" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>

      <!-- 申请时间 -->
      <div class="filter-item">
        <el-date-picker v-model="funding.applyTime" type="daterange" :range-separator="null" start-placeholder="申请日期"
          end-placeholder="申请日期" style="width:240px" value-format="yyyy-MM-dd">
        </el-date-picker>
      </div>


      <!-- 申请成功时间 -->
      <div class="filter-item">
        <el-date-picker v-model="funding.successTime" type="daterange" :range-separator="null" start-placeholder="通过日期"
          end-placeholder="通过日期" style="width:240px" value-format="yyyy-MM-dd">>
        </el-date-picker>
      </div>

      <el-select v-model="otherId" placeholder="其他信息" style="width: 103px" class="filter-item">
        <el-option v-for="item in otherInfoTable" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <!-- 报销名称 -->
      <el-input v-model="funding.name" v-show="otherId=='1'" placeholder="请输入报销名称" style="width:155px"
        class="filter-item"></el-input>

      <!-- 申请人 -->
      <el-autocomplete popper-class="my-autocomplete" v-model="funding.proposerName" v-show="otherId=='2'"
        :fetch-suggestions="querySearch" placeholder="请选择申请人" @select="handleSelect1" style="width: 155px"
        class="filter-item">
        <template slot-scope="{ item }">
          <div class="name">{{ item.fullName }} <span class="id">{{ item.userId }}</span></div>
        </template>
      </el-autocomplete>
      <!-- 审核人 -->
      <el-autocomplete popper-class="my-autocomplete" v-model="funding.verifierName" v-show="otherId=='3'"
        :fetch-suggestions="querySearch2" placeholder="请选择审核人" @select="handleSelect2" style="width: 155px"
        class="filter-item">
        <template slot-scope="{ item }">
          <div class="name">{{ item.fullName }} <span class="id">{{ item.userId }}</span></div>
        </template>
      </el-autocomplete>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearchFunding2">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加
      </el-button>

      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        下载
      </el-button> -->

      <el-dropdown class="filter-item">
        <el-button type="primary">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item><span class="table-operation" @click="handleBill">查看经费</span></el-dropdown-item>
          <el-dropdown-item><span class="table-operation" @click="handleImport">导入报销</span></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 查询结果 -->
      <el-table :data="fundingTableData" tooltip-effect="dark" style="width:100%" border>

        <el-table-column label="报销名称" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申报状态" align="center"
          :filters="[{ text: '申请中', value: '1' }, { text: '报销中', value: '2' },{ text: '报销成功', value: '3' },{ text: '申请失败', value: '4' }]"
          :filter-method="filterBXStatus" filter-placement="bottom-end">

          <template slot-scope="scope">
            <el-tag :type="scope.row.state | BXStatusFilter" style="margin-left: 10px">
              {{ scope.row.state | StateTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.applyTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="报销金额" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.cost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="50px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
                <el-dropdown>
                  <span>
                    <i class="el-icon-s-operation table-operation" style="color: 	#96CDCD;"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="handleJudgeUpdate(scope.row)" style="padding:0; width:40px">
                      <div class="operator" style="color: #87d068;" @click="handleUpdate(scope.row)">
                        <i class="el-icon-edit table-operation"></i>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="handleJudgeDelete(scope.row)" style="padding:0; width:40px">
                      <div class="operator" style="color: #f50;" @click="handleDelete(scope.$index, scope.row)">
                        <i class="el-icon-delete table-operation"></i>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item style="padding:0; width:40px">
                      <div class="operator" style="color: #2db7f5;" @click="handleView(scope.row)">
                        <i class="el-icon-view table-operation"></i>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>



          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: center;margin-top: 30px;">

        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="page.param.pageNum" :page-sizes="[5, 10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper" :total="page.total">
        </el-pagination>

      </div>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :width="width"
        :close-on-click-modal="false" :close-on-press-escape="false" :before-close="handleClose">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="temp.name" placeholder="请输入报销名称" style="width:100%" />
          </el-form-item>
          <el-form-item label="类型">
            <el-input v-model="temp.type" placeholder="请输入报销类型" style="width:100%" />
          </el-form-item>

          <el-form-item label="日期" prop="applyTime">
            <el-date-picker v-model="temp.applyTime" type="datetime" placeholder="选择日期" style="width:100%"
              value-format="yyyy-MM-dd">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="发票">
            <el-input v-model="temp.invoice" placeholder="请输入报销发票" style="width:100%" />
          </el-form-item>
          <el-form-item label="银行卡号">
            <el-input v-model="temp.card" placeholder="请输入银行卡号" style="width:100%" />
          </el-form-item>
          <el-form-item label="任务ID">
            <el-input v-model="temp.taskId" placeholder="请输入对应任务ID" style="width:100%" />
          </el-form-item>
          <el-form-item label="金额">
            <el-input v-model="temp.cost" style="width:100%" placeholder="请输入报销金额   如:+10.0" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm('dataForm')">确 定</el-button>
        </span>

      </el-dialog>
      <el-dialog :title="temp.state | ViewTextFilter" :visible.sync="fundingViewVisible" :width="width">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-s-shop" /> <span>名称：</span> {{ temp.name }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" /> <span>id: </span> {{ temp.id }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-s-opportunity" /> <span>类型：</span> {{ temp.type }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-time" /> <span>申请时间: </span> {{ temp.applyTime }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-time" /> <span>报销成功时间：</span> {{ temp.successTime }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-s-ticket" /> <span>发票: </span> {{ temp.invoice }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-money" /> <span>费用：</span> {{ temp.cost }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-bank-card" /> <span>银行卡号: </span> {{ temp.card }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-bangzhu" /> <span>申请状态：</span> {{ temp.state | StateTextFilter }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-printer" /> <span>任务ID: </span> {{ temp.taskId }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-user" /> <span>审核人姓名：</span> {{ temp.verifierName }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" /> <span>审核人id: </span> {{ temp.verifierId }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-user" /> <span>申请人姓名：</span> {{ temp.proposerName }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" /> <span>申请人id: </span> {{ temp.proposerId }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-user" /> <span>证明人姓名：</span> {{ temp.certifierName }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" /> <span>证明人id: </span> {{ temp.certifierId }}
            </div>
          </el-col>
        </el-row>

        <div slot="footer" class="dialog-footer" v-if="handleJudgePass(temp)">
          <el-button @click="handleChangeState('fail')">驳回</el-button>
          <el-button type="primary" @click="handleChangeState('pass')">通过</el-button>
        </div>
        <div slot="footer" class="dialog-footer" v-if="handleJudgeSuccess(temp)">
          <el-button type="success" @click="handleChangeState('success')">成功报销</el-button>
        </div>
      </el-dialog>

      <el-dialog title="经费查询" :visible.sync="fundingBillVisible" :width="width">

        <div class="filter-container">
          <el-row :gutter="10">
            <el-col :xs="8" :sm="8">
              <div class="view-item"><i class="el-icon-shopping-cart-2" /><span>开销：</span>{{ this.spent }}</div>

            </el-col>
            <el-col :xs="8" :sm="8">
              <div class="view-item"><i class="el-icon-money" /><span>剩余：</span>{{ this.last }}</div>

            </el-col>
            <el-col :xs="8" :sm="8">
              <div class="view-item">
                <i class="el-icon-dessert" /><span>入账：</span>{{ this.income }}</div>
            </el-col>
          </el-row>
        </div>
      </el-dialog>
      <el-dialog title="导入报销" :visible.sync="fundingImportVisible" :width="width">

        <div class="filter-container">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="16">

              <div class="filter-container">
                <el-input v-model="task.title" placeholder="请输入标题" style="width:200px" class="filter-item">
                </el-input>

                <el-select v-model="taskType" placeholder="类型" style="width: 110px" class="filter-item"
                  :command="handleTaskSearch">
                  <el-option v-for="item in taskTypeTable" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="view-item">
                <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleTaskSearch">
                  搜索
                </el-button>
              </div>
            </el-col>
          </el-row>
          <el-table :data="taskTableData" tooltip-effect="dark" style="width:100%" border>

            <el-table-column label="任务标题" align="center">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column label="任务id" align="center">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="70px" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-row>
                  <el-col>
                    <el-dropdown-item><i class="el-icon-plus table-operation" style="color: #87d068;"
                        @click="fundingImportVisible=false;handleCreate(scope.row);"></i></el-dropdown-item>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
          <div style="text-align: center;margin-top: 30px;">

            <el-pagination @current-change="handleCurrentChange2" :current-page="task.pageNum"
              :page-size="task.pageSize" layout="total, prev, pager, next, jumper" :total="taskTotal">
            </el-pagination>

          </div>
        </div>
      </el-dialog>
    </div>

  </div>



</template>
<script>
  import {
    date
  } from 'jszip/lib/defaults';
  export default {
    data() {
      return {
        otherId: '',
        taskTotal: 0,
        taskType: "thesis",
        BillDate: null,
        spent: null,
        last: null,
        income: '',
        fundingViewVisible: false,
        fundingBillVisible: false,
        fundingImportVisible: false,
        width: this.initWidth(),
        currentUser: {},
        proposersTable: [],
        verifiersTable: [],
        timeout: null,

        statusTable: [{
          value: '1',
          label: '申请中',
        }, {
          value: '2',
          label: '报销中',
        }, {
          value: '3',
          label: '报销成功',
        }, {
          value: '4',
          label: '申请失败',
        }, {
          value: '0',
          label: '查看所有',
        }],
        otherInfoTable: [{
            value: "1",
            label: "报销名称"
          },
          {
            value: "2",
            label: "申请人"
          },
          {
            value: "3",
            label: "审核人"
          }
        ],
        taskTypeTable: [{
          value: "thesis",
          label: '论文'
        }, {
          value: "match",
          label: '比赛'
        }, {
          value: "items",
          label: '项目'
        }, {
          value: "copyright",
          label: '著作权'
        }],
        fundingTableData: [],
        taskTableData: [],
        dialogFormVisible: false,
        dialogStatus: "",
        page: {
          param: {
            serialVersionUID: '',
            pageNum: 1,
            pageSize: 10,
            field: '',
            order: '',
          },
          total: 0
        },
        task: {
          pageNum: 1,
          pageSize: 5,
          field: '',
          order: '',
          title: '',
          time: '',
          fullName: '',
          reimbursement: 1,
        },
        temp: {
          id: '',
          verifierId: '',
          certifierId: '',
          name: '',
          type: '',
          applyTime: '',
          successTime: '',
          invoice: '',
          cost: '',
          card: '',
          proposerId: '',
          state: '1',
          taskId: '',
          proposerName: '',
          verifierName: '',
          certifierName: ''
        },

        funding: {
          id: '',
          verifierId: '',
          certifierId: '',
          name: '',
          type: '',
          applyTime: '',
          successTime: '',
          invoice: '',
          cost: '',
          card: '',
          proposerId: '',
          state: '',
          taskId: '',
          proposerName: '',
          verifierName: '',
          certifierName: ''
        },
        textMap: {
          update: '编辑',
          create: '添加'
        },
        paperTypeMap: {
          '1': '核心',
          '2': '普通'
        },
        taskTypeMap: {
          'thesis': '论文',
          'match': '比赛',
          'items': '项目',
          'copyright': '著作权'
        },
        infoMap: {
          'success': '完成',
          'pass': '通过',
          'fail': '驳回',
          'apply': '申报'
        },
        stateMap: {
          'fail': '4',
          'success': '3',
          'pass': '2',
          'apply': '1'
        },
        rules: {
          name: [{
            required: true,
            message: '报销名称不能为空',
            trigger: 'blur'
          }],
          applyTime: [{
            required: true,
            message: '报销时间未选择',
            trigger: 'blur'
          }],
          proposerName: [{
            required: true,
            message: '申请人不能为空',
            trigger: 'change'
          }],
          verifierName: [{
            required: true,
            message: '审核人不能为空',
            trigger: 'change'
          }],
          cost: [{
            required: true,
            message: '报销金额不能为空',
            trigger: 'blur'
          }],
        },
      }
    },
    filters: {
      BXStatusFilter(state) {
        const map = {
          1: "",
          2: "warning",
          3: "success",
          4: "danger"
        }
        return map[state]
      },
      StateTextFilter(state) {
        const map = {
          1: "申请中",
          2: "报销中",
          3: "报销成功",
          4: "申请失败"
        }
        return map[state]
      },
      ViewTextFilter(state) {
        const map = {
          1: "审核",
          2: "查看",
          3: "查看",
          4: "查看"
        }
        return map[state]
      }
    },
    methods: {

      initWidth() {
        this.screenWidth = document.body.clientWidth
        if (this.screenWidth < 991) {
          return '90%'
        } else if (this.screenWidth < 1400) {
          return '45%'
        } else {
          return '800px'
        }
      },
      loadUser() {
        const fundingId = -1;
        this.$get(`/studio/funding/${fundingId}`).then((r) => {
          this.proposersTable = r.data.data[0];
          this.verifiersTable = r.data.data[1];
        })
      },

      loadTable() {
        var param = Object.assign({}, this.page.param);
        let funding = Object.assign({}, this.funding);
        funding = this.judgeFundingNull(JSON.stringify(funding)) ? null : funding;
        if (funding && (funding.applyTime != "" && funding.applyTime != null)) {
          funding.applyTime = funding.applyTime[0] + "," + funding.applyTime[1];
        }
        if (funding && (funding.successTime != "" && funding.successTime != null)) {
          funding.successTime = funding.successTime[0] + "," + funding.successTime[1];
        }
        this.$get('studio/funding', {
          ...param,
          ...funding
        }).then((r) => {
          this.fundingTableData = r.data.data.rows;
          this.page.total = r.data.data.total;
        })
      },

      querySearch(queryString, cb) {
        var usersTable = this.proposersTable;
        var results = queryString ? usersTable.filter(this.createFilter(queryString)) : usersTable;
        cb(results);
      },
      querySearch2(queryString, cb) {
        var usersTable = this.verifiersTable;
        var results = queryString ? usersTable.filter(this.createFilter(queryString)) : usersTable;
        cb(results);
      },
      createFilter(queryString) {
        return (user) => {
          return (user.fullName.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      handleSearchFunding2() {
        if (!this.judgeFundingNull(JSON.stringify(this.funding))) {
          this.page.param.pageNum = 1;
        }
        this.handleSearchFunding();
      },
      handleTaskSearch() {
        this.task.pageNum = 1;
        this.importFunding();
      },
      handleSearchFunding() {
        this.loadTable();
      },
      handleSearchBill() {
        var bd1 = "2001-5-1," + this.formatDate(new Date()) + ",-1";
        var bd2 = "2001-5-1," + this.formatDate(new Date()) + ",0";
        var bd3 = "2001-5-1," + this.formatDate(new Date()) + ",1"
        this.$get(`/studio/funding/bill/${bd1}`).then((r) => {
          this.spent = r.data.data;
        })
        this.$get(`/studio/funding/bill/${bd2}`).then((r) => {
          this.last = r.data.data;
        })
        this.$get(`/studio/funding/bill/${bd3}`).then((r) => {
          this.income = r.data.data;
        })
      },
      handleJudgePass(row) {
        if (row.state == 1 && this.currentUser.roleId == 1) return true;
        return false;
      },
      handleJudgeSuccess(row) {
        if (row.state == 2 && this.currentUser.userId == row.verifierId) return true;
        return false;
      },
      handleJudgeDelete(row) {
        if (row.state != 4) return false;
        else return true;
      },
      handleJudgeUpdate(row) {
        if (row.state == 1 || row.state == 4) return true;
        else return false;
      },
      handleSelect1(item) {
        this.funding.proposerName = item.fullName;
        this.funding.proposerId = item.userId;
      },
      handleSelect2(item) {
        this.funding.verifierName = item.fullName;
        this.funding.verifierId = item.userId;
      },
      handleSelect3(item) {
        this.temp.verifierId = item.id;
      },
      handleSelect4(item) {
        this.temp.proposerId = item.id;
      },
      handleIconClick(ev) {},
      handleUpdate(row) {
        this.temp = Object.assign({}, row)
        this.temp.applyTime = this.formatDate(new Date(this.temp.applyTime))
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleDelete(index, row) {
        this.$confirm('此操作将删除该项申报, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.$delete(`studio/funding/${row.id}`).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.handleSearchFunding();
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      handleView(row) {
        this.temp = Object.assign({}, row);
        this.temp.date = new Date(this.temp.applyTime);
        this.fundingViewVisible = true;
      },
      handleBill() {
        this.handleSearchBill();
        this.fundingBillVisible = true;
      },
      handleImport() {
        this.task.title = "";
        this.importFunding();
        this.fundingImportVisible = true;
      },
      handleChangeState(s) {
        var row = this.temp;
        this.$confirm(`此操作将${this.infoMap[s]}该项申报, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          row.state = this.stateMap[s];
          row.verifierId = this.currentUser.roleId;
          this.$put('/studio/funding/state', {
            ...row
          }).then(() => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            });
          })
          this.$put('/studio/funding/', {
            ...row
          }).then(() => {})
          this.handleSearchFunding()

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
        this.fundingViewVisible = false;
      },
      handleSizeChange(val) {
        this.page.param.pageSize = val;
        this.handleSearchFunding();
      },
      handleCurrentChange(val) {
        this.page.param.pageNum = val;
        this.handleSearchFunding();
      },
      handleCurrentChange2(val) {
        this.task.pageNum = val;
        this.importFunding();
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      resetTemp() {
        this.temp = {
          id: '',
          verifierId: '',
          certifierId: '',
          name: '',
          type: '',
          applyTime: this.formatDate(new Date()),
          successTime: '',
          invoice: '',
          cost: '',
          card: '',
          proposerId: '',
          state: '1',
          taskId: '',
          proposerName: '',
          verifierName: '',
          certifierName: ''
        }
      },
      handleCreate(row) {
        this.resetTemp()
        if (row.id) {
          this.getStaskInFo(row.id)

        }
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      filterBXStatus(value, row) {
        return row.state == value
      },
      create(formName) {
        this.temp.proposerId = this.currentUser.userId;
        const funding = this.temp;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$post('/studio/funding/', {
              ...funding
            }).then((r) => {
              this.$message({
                message: '添加成功',
                type: 'success'
              })
            })
            this.handleSearchFunding()
            this.dialogFormVisible = false;
          } else {
            return false;
          }
        });
      },
      update(formName) {
        const funding = this.temp;
        //如果是申报失败，重新申报的，需要修改一下状态
        if (funding.state == "4") {
          funding.state = "1";
          this.$put('/studio/funding/state', {
            ...funding
          })
        }
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$put('/studio/funding/', {
              ...funding
            }).then(() => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
            })
            this.dialogFormVisible = false;
          } else {
            return false;
          }
        });
        this.handleSearchFunding();
      },
      importFunding() {
        this.$get(`/studio/${this.taskType}/`, {
          ...this.task
        }).then((r) => {
          this.taskTotal = r.data.data.total;
          this.taskTableData = this.dealId(r.data.data.rows);
        })
      },
      submitForm(formName) {
        if (this.dialogStatus == 'update') {
          this.update(formName);
        } else if (this.dialogStatus == 'create') {
          this.create(formName);
        }
      },
      initUsers() {
        this.loadUser();
      },
      initCurrentUser() {
        this.currentUser = this.$store.state.account.user;
      },
      initTableData() {
        this.handleSearchFunding();
      },
      formatDate(date) {
        var d = new Date(date);
        return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      },
      judgeFundingNull(f) {
        if (f.applyTime == "" && f.card == "" && f.certifierId == "" && f.certifierName == "" &&
          f.cost == "" && f.id == "" && f.invoice == "" && f.name == "" && f.proposerId == "" && f.proposerName == "" &&
          f.state == "" && f.successTime == "" && f.taskId == "" && f.type == "" &&
          f.verifierName == "" && f.verifierId == "") return true;
        else return false;
      },
      getStaskInFo(id) {
        this.$get(`/studio/${this.taskType}/${id}`).then((r) => {
          this.setTemp(JSON.parse(JSON.stringify(r)));
        })
      },
      dealId(r) {
        return JSON.parse(JSON.stringify(r).replace(/thesisId/g, 'id').replace(/matchId/g, 'id')
          .replace(/itemsId/g, 'id').replace(/copyrightId/g, 'id').replace(/thesis_id/g, 'id').replace(/match_id/g,
            'id')
          .replace(/items_id/g, 'id').replace(/copyright_id/g, 'id'));
      },
      setTemp(r) {
        r = this.dealId(r.data.data);
        this.temp.name = r.title;
        this.temp.cost = r.cost ? r.cost : "";
        this.temp.type = this.taskTypeMap[this.taskType] ? this.taskTypeMap[this.taskType] : "";
        this.temp.invoice = r.invoice ? r.invoice : "";
        this.temp.taskId = r.id ? r.id : "";
      },
      handleCommand(command) {
        this.$message('click on item ' + command);
      }
    },
    mounted() {
      this.initUsers();
      this.initCurrentUser();
      this.initTableData();
      window.onresize = () => {
        return (() => {
          this.width = this.initWidth()
        })()
      }
    }
  }

</script>
<style lang="scss" scoped>
  .operator {
    border:1px solid red;
    width: 100%;
    text-align: center;
  }

  .menu {
    margin: 10px;

    .app-container {
      margin: 0 0 10px 0 !important;
    }
  }

  .el-card.is-always-shadow {
    box-shadow: none;
  }

  .el-card {
    border-radius: 0;
    border: none;

    .el-card__header {
      padding: 10px 20px !important;
      border-bottom: 1px solid #f1f1f1 !important;
    }
  }

  .my-autocomplete {
    li {
      line-height: normal;
      padding: 7px;

      .name {
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .id {
        font-size: 12px;
        color: #b4b4b4;
        position: absolute;
        right: 5px;
      }

      .highlighted .id {
        color: #ddd;
      }
    }
  }

  .view-item {
    margin: 7px;

    i {
      font-size: .97rem;
    }

    span {
      margin-left: 5px;
    }
  }

</style>
