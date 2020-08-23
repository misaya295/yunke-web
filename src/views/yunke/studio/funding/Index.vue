<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 报销名称 -->
      <el-input
        v-model="funding.name"
        placeholder="请输入报销名称"
        style="width:155px;"
        class="filter-item search-item"
      ></el-input>
      <el-input
        v-model="funding.type"
        placeholder="请输入报销类型"
        style="width:155px;"
        class="filter-item search-item"
      ></el-input>

      <!-- 类型 -->
      <!-- <el-select
        v-model="funding.state"
        placeholder="状态"
        class="filter-item search-item"
        style="width:100px"
      >
        <el-option
          v-for="item in statusTable"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>-->
      <!-- 申请人 -->
      <el-autocomplete
        popper-class="my-autocomplete"
        v-model="funding.proposerName"
        :fetch-suggestions="querySearch"
        placeholder="请选择申请人"
        @select="handleSelect1"
        style="width: 155px"
        class="filter-item search-item"
      >
        <template slot-scope="{ item }">
          <div class="name">
            {{ item.fullName }}
            <span class="id">{{ item.userId }}</span>
          </div>
        </template>
      </el-autocomplete>

      <!-- 申请时间 -->
      <div class="filter-item">
        <el-date-picker
          v-model="funding.success_time"
          type="daterange"
          :range-separator="null"
          start-placeholder="申请时间"
          end-placeholder
          value-format="yyyy-MM-dd"
          class="search-item"
          style="width:255px"
        ></el-date-picker>
      </div>
      <el-button class="filter-item" type="primary" plain @click="handleSearchFunding2">搜索</el-button>
      <el-button class="filter-item" type="warning" plain @click="handleReset">重置</el-button>
      <el-button
        v-hasPermission="['funding:add']"
        class="filter-item"
        type="success"
        plain
        @click="handleCreate"
      >添加</el-button>

      <el-dropdown class="filter-item" trigger="click">
        <el-button>
          更多操作
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <span class="table-operation" @click="handleBill">查看经费</span>
          </el-dropdown-item>
          <el-dropdown-item>
            <span class="table-operation" @click="handleImport">导入报销</span>
          </el-dropdown-item>
          <el-dropdown-item
            v-has-permission="['task:delete']"
            @click.native="batchDelete"
          >{{ $t('table.delete') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 查询结果 -->
      <el-table
        ref="table"
        :data="fundingTableData"
        style="width:100%"
        border
        fit
        @selection-change="onSelectChange"
        @row-click="toogleExpand"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="报销名称"
          align="center"
          min-width="130px"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" min-width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row.type}}</span>
          </template>
        </el-table-column>
        <el-table-column label="费用" align="center" min-width="100px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.cost }}</span>
          </template>
        </el-table-column>

        <el-table-column label="申请人" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.proposerName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="证明人" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.certifierName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核人" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.verifierName }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          :filters="[{ text: '申请中', value: '1' }, { text: '报销中', value: '2' },{ text: '报销成功', value: '3' },{ text: '申请失败', value: '4' }]"
          :filter-method="filterBXStatus"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.state | BXStatusFilter">{{ scope.row.state | StateTextFilter }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('table.operation')"
          align="center"
          min-width="105px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-tooltip
              v-hasPermission="['funding:view']"
              class="item"
              effect="dark"
              content="查看详情"
              placement="top"
              :enterable="false"
            >
              <i
                v-hasPermission="['funding:view']"
                class="el-icon-info table-operation"
                style="color: #909399;"
                @click.stop="toogleExpand(scope.row)"
              />
            </el-tooltip>

            <el-tooltip
              v-hasPermission="['funding:update']"
              class="item"
              effect="dark"
              content="修改报销"
              placement="top"
              :enterable="false"
            >
              <i
                v-hasPermission="['funding:update']"
                class="el-icon-setting table-operation"
                style="color: #2db7f5;"
                @click="handleUpdate(scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['funding:delete']"
              class="item"
              effect="dark"
              content="删除报销"
              placement="top"
              :enterable="false"
            >
              <i
                v-hasPermission="['funding:delete']"
                class="el-icon-delete table-operation"
                style="color: #f50;"
                @click="handleDelete(scope.$index, scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['funding:check']"
              class="item"
              effect="dark"
              content="审核报销"
              placement="top"
              :enterable="false"
            >
              <i
                v-hasPermission="['funding:check']"
                class="el-icon-s-check table-operation"
                style="color: #909399;"
                @click="handleCheck(scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['funding:check']"
              class="item"
              effect="dark"
              content="完成报销"
              placement="top"
              :enterable="false"
            >
              <i
                v-hasPermission="['funding:check']"
                class="el-icon-check table-operation"
                style="color: #909399;"
                @click="handleSuccess(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column type="expand" width="1px">
          <template slot-scope="{row}">
            <el-form :title="$t('common.view')" :width="width" class="user-view" inline>
              <el-row>
                <el-col :span="8">
                  <el-form-item class="view-item">
                    <span>
                      <i class="el-icon-bank-card" />
                      {{ '银行卡号：' }}
                    </span>
                    {{ row.card }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item class="view-item">
                    <span>
                      <i class="el-icon-time" />
                      {{ '申请时间：' }}
                    </span>
                    {{ row.applyTime }}
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item class="view-item">
                    <span>
                      <i class="el-icon-time" />
                      {{ '成功报销时间：' }}
                    </span>
                    {{ row.successTime }}
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item class="view-item">
                    <span>
                      <i class="el-icon-printer" />
                      {{ '任务：' }}
                    </span>
                    {{ getTaskName(row) }}
                    <el-tooltip
                      v-if="row.taskId!==null&&row.taskId!==''&&judgeTypeIsTaskCh(row.type)"
                      class="item"
                      effect="dark"
                      content="跳转"
                      placement="top"
                      :enterable="false"
                    >
                      <i
                        class="el-icon-share table-operation"
                        v-if="row.taskId!==null&&row.taskId!==''&&judgeTypeIsTaskCh(row.type)"
                        @click="jump(row)"
                      ></i>
                    </el-tooltip>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item class="view-item">
                    <div class="demo-image">
                      <span>
                        <i class="el-icon-s-ticket" />
                        {{ '发票：' }}
                      </span>
                      <div
                        class="block"
                        v-for="(item, i) in (row.invoice===null||row.invoice==='')?[]:row.invoice.split(',')"
                        :key="i"
                      >
                        <el-image :src="item" @click="showpreViewDialog(item)"></el-image>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 30px;">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
          :current-page="page.param.pageNum"
          :page-sizes="[5, 10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
          :hide-on-single-page="fundingHidePage"
        ></el-pagination>
      </div>
      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="dialogFormVisible"
        :width="width"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <el-form
          ref="dataForm"
          :rules="rules"
          :model="temp"
          label-position="right"
          label-width="70px"
          top="3vh"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="temp.name" placeholder="请输入报销名称" style="width:100%"></el-input>
          </el-form-item>
          <!-- 如果申报是四种任务之一，就不给修改类型，原因：1、任务类型已确定，固定了 2、查询任务实际上四是个接口，需要根据类型调用不同的接口，避免用户修改导致接口不能使用 -->
          <el-form-item label="类型">
            <el-input
              v-model="temp.type"
              :disabled="judgeTypeIsTaskCh(temp.type)"
              placeholder="请输入报销类型"
              style="width:100%"
            />
          </el-form-item>

          <el-form-item label="日期" prop="applyTime">
            <el-date-picker
              v-model="temp.applyTime"
              type="date"
              placeholder="选择日期"
              style="width:100%"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="发票">
            <el-upload
              :before-upload="handleBeforeUpload"
              :before-remove="handleBeforeRemove"
              :on-success="handleSuccessInvoice"
              :file-list="invoiceFileList"
              :action="uploadUrl"
              :headers="headers"
              :on-preview="handlePreview"
              :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
              :limit="uploadPicLimit"
              list-type="picture-card"
              multiple
              drag
            >
              <i class="el-icon-plus" />
              <div
                slot="tip"
                style="display: block;"
                class="el-upload__tip"
              >请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
            </el-upload>
          </el-form-item>
          <!-- 证明人和审核人名单通用 -->
          <el-form-item label="证明人">
            <el-autocomplete
              popper-class="my-autocomplete"
              v-model="temp.certifierName"
              :fetch-suggestions="querySearch2"
              placeholder="请选择证明人"
              @select="handleSelect3"
              style="width: 100%"
              class="filter-item"
            >
              <template slot-scope="{ item }">
                <div class="name">
                  {{ item.fullName }}
                  <span class="id">{{ item.userId }}</span>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>

          <el-form-item label="银行卡号">
            <el-input v-model="temp.card" placeholder="请输入银行卡号" style="width:100%" />
          </el-form-item>
          <el-form-item label="任务ID">
            <el-input v-model="temp.taskId" placeholder="请输入对应任务ID" style="width:100%" />
          </el-form-item>
          <el-form-item label="金额" prop="cost">
            <el-input v-model="temp.cost" style="width:100%" placeholder="请输入报销金额   如:+1.0 或 -1.0" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="warning" plain @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" plain @click="submitForm('dataForm')">确 定</el-button>
        </span>
      </el-dialog>

      <el-image-viewer v-if="showViewer" :on-close="closeViewer" :url-list="srcList" />

      <el-dialog
        :title="temp.state | ViewTextFilter"
        :visible.sync="fundingViewVisible"
        :width="width"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-s-shop" />
              <span>名称：</span>
              {{ temp.name }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" />
              <span>id:</span>
              {{ temp.id }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-s-opportunity" />
              <span>类型：</span>
              {{ temp.type }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-time" />
              <span>申请时间:</span>
              {{ temp.applyTime }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-time" />
              <span>报销成功时间：</span>
              {{ temp.successTime }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-s-ticket" />
              <span>发票:</span>
              <i class="el-icon-view table-operation" @click="onPreview"></i>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-money" />
              <span>费用：</span>
              {{ temp.cost }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-bank-card" />
              <span>银行卡号:</span>
              {{ temp.card }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-bangzhu" />
              <span>申请状态：</span>
              {{ temp.state | StateTextFilter }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-printer" />
              <span>任务ID:</span>
              {{ temp.taskId }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-user" />
              <span>审核人姓名：</span>
              {{ temp.verifierName }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" />
              <span>审核人id:</span>
              {{ temp.verifierId }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-user" />
              <span>申请人姓名：</span>
              {{ temp.proposerName }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" />
              <span>申请人id:</span>
              {{ temp.proposerId }}
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-user" />
              <span>证明人姓名：</span>
              {{ temp.certifierName }}
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="view-item">
              <i class="el-icon-coin" />
              <span>证明人id:</span>
              {{ temp.certifierId }}
            </div>
          </el-col>
        </el-row>

        <div slot="footer" class="dialog-footer" v-if="handleJudgePass(temp)">
          <el-button plain v-if="judgeCertificateIsNull()" @click="handleCertificate">证明</el-button>

          <el-button type="warning" plain @click="handleChangeState('fail')">驳回</el-button>
          <el-button type="primary" plain @click="handleChangeState('pass')">通过</el-button>
        </div>
        <div slot="footer" class="dialog-footer" v-else>
          <el-button type="success" plain @click="handleChangeState('success')">完成</el-button>
        </div>
      </el-dialog>

      <el-dialog
        title="经费查询"
        :visible.sync="fundingBillVisible"
        :width="width"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <div class="filter-container">
          <el-row :gutter="10">
            <el-col :xs="8" :sm="8">
              <div class="view-item">
                <i class="el-icon-shopping-cart-2" />
                <span>开销：</span>
                {{ this.spent }}
              </div>
            </el-col>
            <el-col :xs="8" :sm="8">
              <div class="view-item">
                <i class="el-icon-money" />
                <span>剩余：</span>
                {{ this.last }}
              </div>
            </el-col>
            <el-col :xs="8" :sm="8">
              <div class="view-item">
                <i class="el-icon-dessert" />
                <span>入账：</span>
                {{ this.income }}
              </div>
            </el-col>
          </el-row>
        </div>
      </el-dialog>
      <el-dialog
        title="导入报销"
        :visible.sync="fundingImportVisible"
        :width="width"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <div class="filter-container">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="16">
              <div class="filter-container">
                <el-input
                  v-model="task.title"
                  placeholder="请输入标题"
                  style="width:200px"
                  class="filter-item"
                ></el-input>
                <el-select
                  v-model="taskType"
                  placeholder="类型"
                  style="width: 110px"
                  class="filter-item"
                >
                  <el-option
                    v-for="item in taskTypeTable"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
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
            <el-table-column
              label="操作"
              align="center"
              width="70px"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
                <el-row>
                  <el-col>
                    <el-dropdown-item>
                      <i
                        class="el-icon-plus table-operation"
                        style="color: #87d068;"
                        @click="fundingImportVisible=false;handleCreate(scope.row);"
                      ></i>
                    </el-dropdown-item>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 30px;">
            <el-pagination
              @current-change="handleCurrentChange2"
              :current-page="task.pageNum"
              background
              :page-size="task.pageSize"
              layout="total, prev, pager, next, jumper"
              :total="taskTotal"
              :hide-on-single-page="teskHidepage"
            ></el-pagination>
          </div>
        </div>
      </el-dialog>
    </div>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="40%"
      @close="previewDialogClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-image :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import ElImageViewer from "element-ui/packages/image/src/image-viewer";

import { qiNiuUrl } from "@/settings";
import { getToken } from "@/utils/auth";
import { validateFileExt } from "@/utils/my-validate";
import { date } from "jszip/lib/defaults";
import Pagination from "@/components/Pagination";
export default {
  components: {
    ElImageViewer,
    Pagination,
  },
  watch: {
    taskType: "handleTaskSearch",
    "task.title": {
      handler: "handleTaskSearch",
    },
    "temp.successTime": {
      handler: "setSuccessTime",
    },
  },
  data() {
    return {
      // 上传图片数量限制
      uploadPicLimit: 3,
      // 超过图片数量限制时隐藏上传组件
      editrepairinvoicehideupload: false,
      //任务名
      taskName: "",
      // 保存预览图片路径
      previewPath: "",
      //预览窗口显示与影藏
      previewVisible: false,
      //funding分页是否隐藏
      fundingHidePage: false,
      //tesk分页是否隐藏
      teskHidepage: false,
      //已选funding
      selection: [],

      showViewer: false,
      srcList: [],

      // 保存图片地址
      fileUrlList: [],

      // 上传图片的URL地址
      uploadUrl: qiNiuUrl,
      invoiceFileList: [],
      invoiceFiles: [],
      addInvoiceListLength: 0,

      headers: {
        Authorization: `bearer ${getToken()}`,
      },
      otherId: "1",
      taskTotal: 0,
      taskType: "thesis",
      BillDate: null,
      spent: null,
      last: null,
      income: "",
      fundingViewVisible: false,
      fundingBillVisible: false,
      fundingImportVisible: false,
      width: this.initWidth(),
      currentUser: {},
      proposersTable: [],
      verifiersTable: [],
      timeout: null,

      statusTable: [
        {
          value: "1",
          label: "申请中",
        },
        {
          value: "2",
          label: "报销中",
        },
        {
          value: "3",
          label: "报销成功",
        },
        {
          value: "4",
          label: "申请失败",
        },
        {
          value: "0",
          label: "查看所有",
        },
      ],
      otherInfoTable: [
        {
          value: "1",
          label: "报销名称",
        },
        {
          value: "2",
          label: "申请人",
        },
        {
          value: "3",
          label: "审核人",
        },
      ],
      taskTypeTable: [
        {
          value: "thesis",
          label: "论文",
        },
        {
          value: "match",
          label: "比赛",
        },
        {
          value: "items",
          label: "项目",
        },
        {
          value: "copyright",
          label: "著作权",
        },
      ],
      fundingTableData: [],
      taskTableData: [],
      dialogFormVisible: false,
      dialogStatus: "",
      page: {
        param: {
          serialVersionUID: "",
          pageNum: 1,
          pageSize: 10,
          field: "",
          order: "",
        },
        total: 0,
      },
      task: {
        pageNum: 1,
        pageSize: 5,
        field: "",
        order: "",
        title: "",
        time: "",
        fullName: "",
        reimbursement: 0,
      },
      temp: {
        id: "",
        verifierId: "",
        certifierId: "",
        name: "",
        type: "",
        applyTime: "",
        successTime: "",
        invoice: "",
        cost: "",
        card: "",
        proposerId: "",
        state: "1",
        taskId: "",
        proposerName: "",
        verifierName: "",
        certifierName: "",
      },

      funding: {
        id: "",
        verifierId: "",
        certifierId: "",
        name: "",
        type: "",
        applyTime: "",
        successTime: "",
        invoice: "",
        cost: "",
        card: "",
        proposerId: "",
        state: "",
        taskId: "",
        proposerName: "",
        verifierName: "",
        certifierName: "",
        success_time: "",
      },
      textMap: {
        update: "编辑",
        create: "添加",
      },
      paperTypeMap: {
        "1": "核心",
        "2": "普通",
      },
      taskTypeMap: {
        thesis: "论文",
        match: "比赛",
        items: "项目",
        copyright: "著作权",
      },
      taskType2Eng: {
        论文: "thesis",
        比赛: "match",
        项目: "items",
        著作权: "copyright",
      },
      infoMap: {
        success: "完成",
        pass: "通过",
        fail: "驳回",
        apply: "申报",
      },
      stateMap: {
        fail: 4,
        success: 3,
        pass: 2,
        apply: 1,
      },
      rules: {
        name: [
          {
            required: true,
            message: "报销名称不能为空",
            trigger: "blur",
          },
        ],
        applyTime: [
          {
            required: true,
            message: "报销时间未选择",
            trigger: "blur",
          },
        ],
        cost: [
          {
            validator(rule, value, callback) {
              if (value === "") {
                callback();
              }
              if (Number.isInteger(Number(value))) {
                callback();
              } else {
                callback(new Error("请输入有效数字"));
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  filters: {
    BXStatusFilter(state) {
      const map = {
        1: "",
        2: "warning",
        3: "success",
        4: "danger",
      };
      return map[state];
    },
    StateTextFilter(state) {
      const map = {
        1: "申请中",
        2: "报销中",
        3: "报销成功",
        4: "申请失败",
      };
      return map[state];
    },
    ViewTextFilter(state) {
      const map = {
        1: "审核",
        2: "查看",
        3: "查看",
        4: "查看",
      };
      return map[state];
    },
  },
  methods: {
    setSuccessTime() {
      this.$put("/studio/funding/", {
        ...this.temp,
      }).then((r) => {});
    },
    // 修改时的图片预览效果
    handlePreview(file) {
      if ("url" in file) {
        this.previewPath = file.url;
      } else {
        this.previewPath = file.response.data.url;
      }
      this.previewVisible = true;
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = "";
      this.previewVisible = false;
    },
    //查看时的图片预览
    onPreview() {
      if (!this.temp.invoice) {
        this.$message({
          message: "暂无数据",
          type: "warning",
        });
      } else {
        this.showViewer = true;
        this.fundingViewVisible = false;
      }
    },
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item;
      this.previewVisible = true;
    },
    // 手风琴效果
    toogleExpand(row, event, column) {
      const $table = this.$refs.table;
      this.fundingTableData.map((item) => {
        if (row.id !== item.id) {
          $table.toggleRowExpansion(item, false);
        }
      });
      $table.toggleRowExpansion(row);
    },

    getRowKey(row) {
      return row.id;
    },
    closeViewer() {
      this.showViewer = false;
      this.fundingViewVisible = true;
    },
    onSelectChange(selection) {
      this.selection = selection;
    },
    handleBeforeUpload(file) {
      if (file.size / 1024 > 5000) {
        this.$message({
          message: "上传文件大小不能超过5MB!",
          type: "error",
        });
        return false;
      } else {
        const ext = file.name.replace(/.+\./, "");
        if (!validateFileExt(ext)) {
          this.$message({
            type: "error",
            message: "禁止上传" + ext + "类型的附件",
          });
          return false;
        }
      }
    },
    handleBeforeRemove(file, fileList) {
      let fileUrl = "";
      let flag = false;
      // 添加
      if (this.dialogStatus === "create") {
        fileUrl = file.response.data.url;
        flag = true;
      } else {
        // 修改
        fileUrl = file.url;
      }
      if (flag) this.addInvoice(fileUrl, file);
      else this.updateInvoice(file);
      // for (let i = 0; i < this.invoiceFiles.length; i++) {
      //   if (this.invoiceFiles[i].uid === file.uid) {
      //     this.$delete(`oss/content/${this.invoiceFiles[i].id}`).then(() => {
      //       this.$message({
      //         message: '删除成功',
      //         type: 'success'
      //       })
      //     })
      //     return true
      //   }
      // }
    },
    addInvoice(fileUrl, file) {
      for (let j = 0; j < this.invoiceFiles.length; j++) {
        if (this.invoiceFiles[j].uid === file.uid) {
          this.$delete(`oss/content/${this.invoiceFiles[j].id}`);
          // 根据图片数量分别执行删除的功能
          if (this.invoiceFiles.length === 1) {
            this.temp.invoice = "";
          } else if (this.invoiceFiles.length === 2) {
            if (j === 0) {
              this.temp.invoice = this.temp.invoice.split(fileUrl + ",")[1];
            } else {
              this.temp.invoice = this.temp.invoice.split("," + fileUrl)[0];
            }
          } else {
            if (j === 0) {
              this.temp.invoice = this.temp.invoice.split(fileUrl + ",")[1];
            } else if (j === 1) {
              const firsturl = this.temp.invoice.split("," + fileUrl)[0];
              const lasturl = this.temp.invoice.split("," + fileUrl)[1];
              this.temp.invoice = firsturl + lasturl;
            } else {
              this.temp.invoice = this.temp.invoice.split("," + fileUrl)[0];
            }
          }
          this.addInvoiceListLength--;
          // this.addInvoiceChange();
          return true;
        }
      }
    },
    updateInvoice(file) {
      for (let n = 0; n < this.invoiceFileList.length; n++) {
        if (this.invoiceFileList[n].uid === file.uid) {
          const fileUrl = this.invoiceFileList[n].url;
          const fileName = this.invoiceFileList[n].url
            .substring(28)
            .split(".")[0];
          this.$delete(`oss/content`, { fileName: fileName });
          // 根据图片数量分别执行删除的功能
          if (this.invoiceFileList.length === 1) {
            this.temp.invoice = "";
            this.invoiceFileList = [];
          } else if (this.invoiceFileList.length === 2) {
            if (n === 0) {
              this.temp.invoice = this.temp.invoice.split(fileUrl + ",")[1];
              this.invoiceFileList.shift();
            } else {
              this.temp.invoice = this.temp.invoice.split("," + fileUrl)[0];
              this.invoiceFileList.pop();
            }
          } else {
            if (n === 0) {
              this.temp.invoice = this.temp.invoice.split(fileUrl + ",")[1];
              this.invoiceFileList.shift();
            } else if (n === 1) {
              const firsturl = this.temp.invoice.split("," + fileUrl)[0];
              const lasturl = this.temp.invoice.split("," + fileUrl)[1];
              this.temp.invoice = firsturl + lasturl;
              this.invoiceFileList.splice(n, 1);
            } else {
              this.temp.invoice = this.temp.invoice.split("," + fileUrl)[0];
              this.invoiceFileList.pop();
            }
          }
          this.addInvoiceListLength--;
          // this.editInvoiceChange();
          return true;
        }
      }
    },
    handleSuccessInvoice(response, file, fileList) {
      const uid = file.uid;
      const id = response.data.contentId;
      this.invoiceFiles.push({
        uid,
        id,
      });
      this.addInvoiceListLength++;
      if (this.temp.invoice === "" || this.temp.invoice === null) {
        this.temp.invoice = response.data.url;
      } else {
        this.temp.invoice = this.temp.invoice + "," + response.data.url;
      }
    },
    initWidth() {
      this.screenWidth = document.body.clientWidth;
      if (this.screenWidth < 991) {
        return "90%";
      } else if (this.screenWidth < 1400) {
        return "45%";
      } else {
        return "800px";
      }
    },
    loadUser() {
      //fundingId = -1 接口返回申请人和审核人的信息
      const fundingId = -1;
      this.$get(`/studio/funding/${fundingId}`).then((r) => {
        this.proposersTable = r.data.data[0];
        this.verifiersTable = r.data.data[1];
      });
    },

    loadTable() {
      var param = Object.assign({}, this.page.param);
      let funding = Object.assign({}, this.funding);

      funding = this.judgeFundingNull(JSON.stringify(funding)) ? null : funding; //后端根据funding是不是null，判断是不是拿所有数据
      if (
        funding &&
        funding.success_time !== "" &&
        funding.success_time !== null
      ) {
        funding.success_time =
          funding.success_time[0] + "," + funding.success_time[1];
      }
      this.$get("studio/funding", {
        ...param,
        ...funding,
      }).then((r) => {
        this.fundingTableData = r.data.data.rows;
        this.page.total = r.data.data.total;
        this.fundingHidePage = this.page.total == 0 ? true : false;
      });
    },

    querySearch(queryString, cb) {
      var usersTable = this.proposersTable;
      var results = queryString
        ? usersTable.filter(this.createFilter(queryString))
        : usersTable;
      cb(results);
    },
    querySearch2(queryString, cb) {
      var usersTable = this.verifiersTable;
      var results = queryString
        ? usersTable.filter(this.createFilter(queryString))
        : usersTable;
      cb(results);
    },
    createFilter(queryString) {
      return (user) => {
        return (
          user.fullName.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSearchFunding2() {
      if (!this.judgeFundingNull(JSON.stringify(this.funding))) {
        //判断funding是null,则搜索所有内容并从第一页开始
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
      //获取从建校到现在所有的经费开销、入账、剩余
      var bd1 = "2001-05-01," + this.formatDate(new Date()) + ",-1";
      var bd2 = "2001-05-01," + this.formatDate(new Date()) + ",0";
      var bd3 = "2001-05-01," + this.formatDate(new Date()) + ",1";
      this.$get(`/studio/funding/bill/${bd1}`).then((r) => {
        this.spent = r.data.data;
      });
      this.$get(`/studio/funding/bill/${bd2}`).then((r) => {
        this.last = r.data.data;
      });
      this.$get(`/studio/funding/bill/${bd3}`).then((r) => {
        this.income = r.data.data;
      });
    },
    handleJudgePass(row) {
      if (row.state == 1 && this.currentUser.roleId == 1) return true;
      return false;
    },
    handleJudgeSuccess(row) {
      if (row.state == 2 && this.currentUser.userId == row.verifierId)
        return true;
      return false;
    },
    handleJudgeDelete(row) {
      if (row.state !== 4) return false;
      else return true;
    },
    handleJudgeUpdate(row) {
      if (row.state === 1 || row.state === 4) return true;
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
      this.temp.certifierName = item.fullName;
      this.temp.certifierId = item.userId;
    },
    handleCertificate() {
      //添加证明人
      this.temp.certifierId = this.currentUser.userId;
      let funding = Object.assign({}, this.temp);
      this.$put("/studio/funding/", {
        ...funding,
      }).then(() => {
        this.$message({
          message: "操作成功",
          type: "success",
        });
        this.handleSearchFunding();
        this.fundingViewVisible = false;
      });
    },
    handleUpdate(row) {
      //判断是否可以更新
      if (!this.handleJudgeUpdate(row)) {
        this.$message({
          message: "无法修改, 报销中,报销成功都不能修改",
          type: "error",
        });
        return;
      }
      this.resetTemp();
      this.temp = Object.assign({}, row);
      this.temp.applyTime = this.formatDate(new Date(this.temp.applyTime));

      //设置图片数据
      this.setInvoiceFileList();

      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleDelete(index, row) {
      this.$refs.table.toggleRowSelection(row, true);
      this.batchDelete();
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t("tips.noDataSelected"),
          type: "warning",
        });
        return;
      }
      this.$confirm(this.$t("tips.confirmDelete"), this.$t("common.tips"), {
        confirmButtonText: this.$t("common.confirm"),
        cancelButtonText: this.$t("common.cancel"),
        type: "warning",
      })
        .then(() => {
          const fundingIds = [];
          this.selection.forEach((r) => {
            if (r.state === 4) fundingIds.push(r.id);
          });
          this.delete(fundingIds.join(","));
        })
        .catch(() => {
          this.clearSelections();
        });
    },
    delete(fundingIds) {
      this.loading = true;
      if (fundingIds === "") {
        this.$message({
          message: "状态为'报销失败'的申报才能删除",
          type: "error",
        });
      } else {
        this.$delete(`studio/funding/${fundingIds}`).then(() => {
          this.$message({
            message: this.$t("tips.deleteSuccess"),
            type: "success",
          });
          this.handleSearchFunding();
        });
      }
    },
    handleCheck(row) {
      if (row.state !== 1) {
        //fundingIds等于"", 说明没有选择状态为失败的报销
        this.$message({
          message: "状态为'申请中'才能审核",
          type: "error",
        });
        return;
      }
      this.temp = Object.assign({}, row);
      //有发票信息就初始化图片地址
      if (this.temp.invoice) {
        this.initImageSrcList(this.temp.invoice.split(","));
      }

      // this.temp. = new Date(this.temp.applyTime);
      this.fundingViewVisible = true;
    },
    handleSuccess(row) {
      if (row.state !== 2) {
        this.$message({
          message: "状态为'报销中'才能完成报销",
          type: "error",
        });
        return;
      }
      this.temp = Object.assign({}, row);
      //有发票信息就初始化图片地址
      if (this.temp.invoice) {
        this.initImageSrcList(this.temp.invoice.split(","));
      }
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
      let funding = Object.assign({}, this.temp);
      this.$confirm(`此操作将${this.infoMap[s]}该项申报, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true,
      })
        .then(() => {
          funding.verifierId = this.currentUser.roleId;
          //若新状态为报销成功, 给成功报销时间赋值
          if (s === "success") {
            this.temp.successTime = this.formatDate(new Date());
            //修改内容
            this.$put("/studio/funding/", {
              ...funding,
            }).then((r) => {});
          }
          funding.state = this.stateMap[s];
          //修改状态
          this.$put("/studio/funding/state", {
            ...funding,
          }).then(() => {
            this.$message({
              type: "success",
              message: "操作成功!",
            });
            this.handleSearchFunding();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
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
    resetTemp() {
      this.temp = {
        id: "",
        verifierId: "",
        certifierId: "",
        name: "",
        type: "",
        applyTime: this.formatDate(new Date()),
        successTime: "",
        invoice: "",
        cost: "",
        card: "",
        proposerId: "",
        state: "1",
        taskId: "",
        proposerName: "",
        verifierName: "",
        certifierName: "",
      };
    },
    handleCreate(row) {
      this.resetTemp();
      this.invoiceFileList = [];
      //根据row有任务id,需要给this.temp赋值
      if (row.taskId || row.id) {
        this.setTemp(row);
        //设置图片数据
        this.setInvoiceFileList();
      }

      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    //重置
    handleReset() {
      this.funding.name = "";
      this.funding.type = "";
      this.funding.applyTime = "";
      this.funding.successTime = "";
      this.funding.proposerId = "";
      this.funding.proposerName = "";
      this.funding.certifierId = "";
      this.funding.certifierName = "";
      this.handleSearchFunding();
    },
    filterBXStatus(value, row) {
      return row.state === value;
    },
    create(formName) {
      //申请人为当前登录用户
      this.temp.proposerId = this.currentUser.userId;
      const funding = this.temp;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$post("/studio/funding/", {
            ...funding,
          }).then((r) => {
            this.$message({
              message: "添加成功",
              type: "success",
            });
            this.handleSearchFunding();
            this.dialogFormVisible = false;
          });
        } else {
          return false;
        }
      });
    },
    update(formName) {
      let funding = Object.assign({}, this.temp);

      //如果是申报失败，重新申报的，需要修改一下状态
      if (funding.state === 4) {
        funding.state = 1;
        this.$put("/studio/funding/state", {
          ...funding,
        });
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$put("/studio/funding/", {
            ...funding,
          }).then(() => {
            this.$message({
              message: "操作成功",
              type: "success",
            });
            this.handleSearchFunding();
            this.dialogFormVisible = false;
          });
        } else {
          return false;
        }
      });
      this.handleSearchFunding();
    },
    importFunding() {
      this.$get(`/studio/${this.taskType}/`, {
        ...this.task,
      }).then((r) => {
        this.taskTotal = r.data.data.total;
        this.taskTableData = this.dealId(r.data.data.rows);
        this.teskHidepage = this.taskTotal === 0 ? true : false;
      });
    },
    submitForm(formName) {
      if (this.dialogStatus === "update") {
        this.update(formName);
      } else if (this.dialogStatus === "create") {
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
    initImageSrcList(arr) {
      let i;
      this.srcList = [];
      for (i = 0; i < arr.length; i++) {
        this.srcList.push(arr[i]);
      }
    },
    formatDate(date) {
      //格式化日期
      var d = new Date(date);
      let year = d.getFullYear();
      let month =
        d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
      return year + "-" + month + "-" + day;
    },
    judgeFundingNull(f) {
      //判断查询内容是否为空
      if (
        f.applyTime === "" &&
        f.card === "" &&
        f.certifierId === "" &&
        f.certifierName === "" &&
        f.cost === "" &&
        f.id === "" &&
        f.invoice === "" &&
        f.name === "" &&
        f.proposerId === "" &&
        f.proposerName === "" &&
        f.state === "" &&
        f.successTime === "" &&
        f.taskId === "" &&
        f.type === "" &&
        f.verifierName === "" &&
        f.verifierId === ""
      )
        return true;
      else return false;
    },
    judgeCertificateIsNull() {
      if (this.temp.certifierId === null || this.temp.certifierId === "")
        return true;
      return false;
    },
    //判断类型是不是四种任务类型之一
    judgeTypeIsTask(type) {
      if (
        type === "thesis" ||
        type === "match" ||
        type === "items" ||
        type === "copyright"
      )
        return true;
      return false;
    },
    judgeTypeIsTaskCh(type) {
      if (
        type === "论文" ||
        type === "比赛" ||
        type === "项目" ||
        type === "著作权" ||
        type === "考证"
      )
        return true;
      return false;
    },
    getStaskInFo(id) {
      this.$get(`/studio/${this.taskType}/${id}`).then((r) => {
        this.setTemp(JSON.parse(JSON.stringify(r)));
      });
    },
    //获取任务名
    getTaskName(row) {
      if (!this.judgeTypeIsTaskCh(row.type)) return;
      if(row.type==="考证"){
          this.$get(`/studio/certificate/${row.taskId}`).then((r) => {
            this.taskName = r.data.data.title;
          });
        }else{
          //修改taskType以调用不同的接口
          this.taskType = this.taskType2Eng[row.type]; 
          //获取数据
          this.$get(`/studio/${this.taskType}/${row.taskId}`).then((r) => {
            this.taskName = r.data.data.title;
          });
        }
      //返回名称
      return this.taskName;
    },
    //获取成功报销时间
    getSuccessTime(row) {},
    dealId(r) {
      //改变数据格式，方便调用
      return JSON.parse(
        JSON.stringify(r)
          .replace(/thesisId/g, "id")
          .replace(/matchId/g, "id")
          .replace(/itemsId/g, "id")
          .replace(/copyrightId/g, "id")
          .replace(/thesis_id/g, "id")
          .replace(/match_id/g, "id")
          .replace(/items_id/g, "id")
          .replace(/copyright_id/g, "id")
      );
    },
    setInvoiceFileList() {
      //this.invoiceFileList 设为空数组，不然会出现图片重复的情况
      this.invoiceFileList = [];

      if (this.temp.invoice === null || this.temp.invoice === "") {
        this.fileUrlList = [];
      } else {
        this.fileUrlList = this.temp.invoice.split(",");
      }
      if (this.fileUrlList !== null) {
        for (var i = 0; i < this.fileUrlList.length; i++) {
          var fileurl = this.fileUrlList[i];
          if (fileurl !== null || fileurl !== "") {
            this.invoiceFileList.push({
              name: fileurl.substring(28), //以后域名改了会有bug，因为这里获取名字是从固定的位置开始取
              url: fileurl,
            });
          }
        }
      }
    },
    setTemp(r) {
      //创建正则表达式,验证是不是英文
      var reg = /^[A-Za-z]+$/;
      console.log(r);
      //r有值就用dealId转化一下
      if (r.data) r = this.dealId(r.data.data);
      //if(r.data)处理的是接口返回的r
      else if (r) r = this.dealId(r); //else if(r)处理的是其他条件的r

      if (r.type && this.judgeTypeIsTaskCh(r.type)) {
        if(this.taskType2Eng[r.type]) this.taskType = this.taskType2Eng[r.type];
        else this.taskType = "match"
      }
      // else this.taskType = "";
      this.temp.name = r.title ? r.title : r.name; //从导入报销传来的r只有r.title,从证书管理传来的r只有r.name;两者是同一个东西
      this.temp.cost = r.cost ? r.cost : "";
      this.temp.type = r.type ? r.type : this.taskTypeMap[this.taskType];
      this.temp.invoice = r.invoice ? r.invoice : "";
      this.temp.taskId = r.taskId ? r.taskId : r.id ? r.id : ""; //导入报销传来的是id, 其他模块传来的是taskId;两者是同一个东西,只能存在一个
    },
    handleCommand(command) {
      this.$message("click on item " + command);
    },
    jump(row) {
      const t = {};
      let goal = "";
      t.id = row.taskId;
      t.name = row.name;

      if(row.type == "考证"){
        goal = "考证管理"
      }else{
        goal = row.type + "任务";
      }
      //跳转到任务模块
      this.$router.push({
        name: goal,
        params: {
          Tasks: t,
        },
      });
    },
    getParams() {
      // 取到路由带过来的参数
      const routerParams = this.$route.params.Funding;
      //重置一下temp
      this.resetTemp();
      if (routerParams) {
        //赋值
        this.temp.name = routerParams.name;
        this.temp.applyTime = routerParams.applyTime;
        this.temp.type = routerParams.type;
        this.temp.taskId = routerParams.id;
        this.temp.cost = routerParams.cost;
        this.temp.invoice = routerParams.invoice;

        //打开表单 什么都不传会报错： Cannot read property 'id' of undefined"
        this.handleCreate(this.temp);
      }
    },
  },
  mounted() {
    this.getParams();
    this.initUsers();
    this.initCurrentUser();
    this.initTableData();
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth();
      })();
    };
  },
};
</script>
<style lang="scss" scoped>
.operator {
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
    font-size: 0.97rem;
  }

  span {
    margin-left: 5px;
  }
}
.demo-image {
  display: flex;
}
.demo-image .el-image {
  width: 100px;
  height: 100px;
  margin: 0px 10px;
  border: 1px solid #000;
}
</style>
